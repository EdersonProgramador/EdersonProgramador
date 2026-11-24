import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import pg from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const databaseHost = new URL(databaseUrl).hostname;
const isLocalDatabase = ['localhost', '127.0.0.1', '::1', '[::1]'].includes(databaseHost);
if (!isLocalDatabase && process.env.ALLOW_REMOTE_DB_SETUP !== 'true') {
  throw new Error('Refusing to initialize a remote database. Set ALLOW_REMOTE_DB_SETUP=true only for a disposable development database.');
}

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME?.trim() || 'Admin Local';
if (!adminEmail || !adminPassword || adminPassword.length < 12) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD (at least 12 characters) before running setup.');
}

const pool = new pg.Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('neon.tech') || databaseUrl.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

async function runFile(relativePath) {
  const full = path.join(root, relativePath);
  const sql = fs.readFileSync(full, 'utf8');
  console.log(`Running ${relativePath}...`);
  await pool.query(sql);
  console.log(`OK ${relativePath}`);
}

async function run(sql, label) {
  await pool.query(sql);
  console.log(`OK ${label}`);
}

try {
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await run(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`, 'pgcrypto');
  await run(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`, 'uuid-ossp');

  await runFile('db/full_init.sql');
  await runFile('db/system_migration_v2.sql');
  await runFile('db/lgpd_compliance.sql');

  // Social scheduler (uuid_generate_v4 → gen_random_uuid for Neon)
  {
    const socialPath = path.join(root, 'social_media_scheduler.sql');
    let socialSql = fs.readFileSync(socialPath, 'utf8');
    socialSql = socialSql.replace(/uuid_generate_v4\(\)/g, 'gen_random_uuid()');
    console.log('Running social_media_scheduler.sql...');
    await pool.query(socialSql);
    console.log('OK social_media_scheduler.sql');
  }

  await runFile('db/form_integrations.sql');

  const alters = [
    [`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_id TEXT DEFAULT 'plan1'`, 'plan_id'],
    [`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS api_key TEXT`, 'api_key'],
    [`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`, 'stripe_customer_id'],
    [`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active'`, 'subscription_status'],
    [`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ`, 'terms_accepted_at'],
    [`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS terms_version TEXT DEFAULT '1.0'`, 'terms_version'],
    [`ALTER TABLE public.receivables ADD COLUMN IF NOT EXISTS quantia NUMERIC(15,2)`, 'quantia'],
  ];
  for (const [sql, label] of alters) {
    await run(sql, label);
  }
  await run(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema='public' AND table_name='receivables' AND column_name='amount'
      ) THEN
        UPDATE public.receivables SET quantia = amount WHERE quantia IS NULL;
      END IF;
    END $$;
  `, 'copy amount->quantia');

  await run(`
    CREATE TABLE IF NOT EXISTS public.system_configs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
      config_key TEXT NOT NULL,
      config_value JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(owner_id, config_key)
    );
  `, 'system_configs');

  await pool.query(
    `
    INSERT INTO public.users (
      id, name, email, password, role, owner_id,
      accepted_terms, terms_accepted_at, terms_version,
      plan_id, subscription_status
    ) VALUES (
      $1,
      $2,
      $3,
      $4,
      'OWNER',
      $1,
      TRUE,
      NOW(),
      '1.0',
      'plan1',
      'active'
    )
    ON CONFLICT (email) DO NOTHING
    `,
    [randomUUID(), adminName, adminEmail, passwordHash]
  );
  console.log('OK local admin seed (existing account is not modified)');

  const check = await pool.query(
    `SELECT email, role, subscription_status, owner_id IS NOT NULL AS has_owner FROM users WHERE email = $1`,
    [adminEmail]
  );
  if (!check.rows[0] || check.rows[0].role !== 'OWNER') {
    throw new Error(`ADMIN_EMAIL ${adminEmail} already exists but is not an OWNER; no account was changed.`);
  }
  console.log('Local admin ready:', check.rows[0]);
  console.log('Local DB ready.');
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
