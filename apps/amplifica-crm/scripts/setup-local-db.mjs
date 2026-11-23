import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import bcrypt from 'bcrypt';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

async function runFile(relativePath) {
  const full = path.join(root, relativePath);
  const sql = fs.readFileSync(full, 'utf8');
  console.log(`Running ${relativePath}...`);
  await pool.query(sql);
  console.log(`OK ${relativePath}`);
}

async function run(sql, label) {
  try {
    await pool.query(sql);
    console.log(`OK ${label}`);
  } catch (err) {
    console.warn(`WARN ${label}: ${err.message}`);
  }
}

const adminEmail = (process.env.ADMIN_EMAIL || 'edersonprogramador@gmail.com').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
const adminName = process.env.ADMIN_NAME || 'Ederson Programador';
const passwordHash = await bcrypt.hash(adminPassword, 10);

try {
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

  // Remove admin fictício antigo e garante o admin real (mesmo da API).
  await pool.query(`DELETE FROM public.users WHERE email IN ('admin@amplifica.com', $1)`, [adminEmail]);
  await pool.query(`DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001'`);
  await pool.query(
    `
    INSERT INTO public.users (
      id, name, email, password, role, owner_id,
      accepted_terms, terms_accepted_at, terms_version,
      plan_id, subscription_status
    ) VALUES (
      '00000000-0000-0000-0000-000000000001',
      $2,
      $3,
      $1,
      'OWNER',
      '00000000-0000-0000-0000-000000000001',
      TRUE,
      NOW(),
      '1.0',
      'plan1',
      'active'
    )
    `,
    [passwordHash, adminName, adminEmail]
  );
  console.log(`OK seed ${adminEmail} (senha = ADMIN_PASSWORD)`);

  const check = await pool.query(
    `SELECT email, role, subscription_status, owner_id IS NOT NULL AS has_owner FROM users WHERE email = $1`,
    [adminEmail]
  );
  console.log('User:', check.rows[0]);
  console.log('Local DB ready.');
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await pool.end();
}
