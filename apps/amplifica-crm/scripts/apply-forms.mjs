import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(__dirname, '../db/form_integrations.sql'), 'utf8');
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL missing');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url,
  ssl: url.includes('neon.tech') || url.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

try {
  await pool.query(sql);
  const check = await pool.query(`SELECT to_regclass('public.form_integrations') AS t`);
  console.log('OK form_integrations =', check.rows[0].t);
} finally {
  await pool.end();
}
