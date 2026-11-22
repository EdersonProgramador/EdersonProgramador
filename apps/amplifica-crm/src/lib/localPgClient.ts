import { Pool, type PoolClient, type QueryResult } from 'pg';
import { randomUUID } from 'crypto';

type Filter =
  | { type: 'eq'; column: string; value: unknown }
  | { type: 'neq'; column: string; value: unknown }
  | { type: 'in'; column: string; values: unknown[] }
  | { type: 'or'; expression: string }
  | { type: 'gte'; column: string; value: unknown }
  | { type: 'lte'; column: string; value: unknown }
  | { type: 'ilike'; column: string; value: unknown };

type SelectOptions = { count?: 'exact'; head?: boolean };

let sharedPool: Pool | null = null;

export function getLocalPool(connectionString?: string): Pool {
  if (!sharedPool) {
    const url = connectionString || process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is required for local Postgres mode');
    sharedPool = new Pool({
      connectionString: url,
      ssl: url.includes('neon.tech') || url.includes('sslmode=require')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }
  return sharedPool;
}

function quoteIdent(ident: string): string {
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(ident)) {
    throw new Error(`Invalid identifier: ${ident}`);
  }
  return `"${ident}"`;
}

/** Known Supabase-style embeds: parent → { childTable: fkOnChild } (one-to-many) */
const INBOUND_EMBEDS: Record<string, Record<string, string>> = {
  social_posts: { post_media: 'post_id', post_schedules: 'post_id' },
};

/** Known embeds: parent → { relatedTable: fkOnParent } (many-to-one) */
const OUTBOUND_EMBEDS: Record<string, Record<string, string>> = {
  post_schedules: { social_posts: 'post_id', social_accounts: 'social_account_id' },
};

function parseSelectColumns(columns: string): { selectSql: string; embeds: string[] } {
  if (!columns || columns === '*') return { selectSql: '*', embeds: [] };
  const embeds: string[] = [];
  const cleaned = columns.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\*\s*\)/g, (_m, name: string) => {
    embeds.push(name);
    return '';
  });
  const base = cleaned
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)
    .join(', ');
  return { selectSql: base || '*', embeds };
}

async function attachEmbeds(pool: Pool, parentTable: string, rows: any[], embeds: string[]) {
  if (!rows.length || !embeds.length) return rows;

  for (const embed of embeds) {
    const inboundFk = INBOUND_EMBEDS[parentTable]?.[embed];
    if (inboundFk) {
      const ids = rows.map((r) => r.id).filter(Boolean);
      if (!ids.length) {
        rows.forEach((r) => { r[embed] = []; });
        continue;
      }
      const res = await pool.query(
        `SELECT * FROM ${quoteIdent(embed)} WHERE ${quoteIdent(inboundFk)} = ANY($1::uuid[])`,
        [ids]
      );
      const grouped: Record<string, any[]> = {};
      for (const child of res.rows) {
        const key = String(child[inboundFk]);
        (grouped[key] ||= []).push(child);
      }
      for (const row of rows) {
        row[embed] = grouped[String(row.id)] || [];
      }
      continue;
    }

    const outboundFk = OUTBOUND_EMBEDS[parentTable]?.[embed]
      || (embed.endsWith('s') ? `${embed.slice(0, -1)}_id` : `${embed}_id`);

    if (outboundFk && rows.some((r) => r[outboundFk] !== undefined)) {
      const ids = [...new Set(rows.map((r) => r[outboundFk]).filter(Boolean))];
      if (!ids.length) {
        rows.forEach((r) => { r[embed] = null; });
        continue;
      }
      const res = await pool.query(
        `SELECT * FROM ${quoteIdent(embed)} WHERE id = ANY($1::uuid[])`,
        [ids]
      );
      const byId: Record<string, any> = {};
      for (const related of res.rows) byId[String(related.id)] = related;
      for (const row of rows) {
        row[embed] = row[outboundFk] ? byId[String(row[outboundFk])] || null : null;
      }
      continue;
    }

    // Fallback inbound: {parent_singular}_id on child
    const singular = parentTable.endsWith('s') ? parentTable.slice(0, -1) : parentTable;
    const guessFk = `${singular}_id`;
    try {
      const ids = rows.map((r) => r.id).filter(Boolean);
      const res = await pool.query(
        `SELECT * FROM ${quoteIdent(embed)} WHERE ${quoteIdent(guessFk)} = ANY($1::uuid[])`,
        [ids]
      );
      const grouped: Record<string, any[]> = {};
      for (const child of res.rows) {
        const key = String(child[guessFk]);
        (grouped[key] ||= []).push(child);
      }
      for (const row of rows) {
        row[embed] = grouped[String(row.id)] || [];
      }
    } catch {
      rows.forEach((r) => { r[embed] = []; });
    }
  }

  return rows;
}

function parseOrExpression(expression: string, params: unknown[]): string {
  // PostgREST style: col.eq.val,col2.eq.val2
  const parts = expression.split(',').map((p) => p.trim()).filter(Boolean);
  const clauses: string[] = [];

  for (const part of parts) {
    const match = part.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\.(eq|neq|gte|lte|ilike)\.(.+)$/);
    if (!match) continue;
    const [, column, op, rawValue] = match;
    params.push(rawValue);
    const placeholder = `$${params.length}`;
    const col = quoteIdent(column);
    if (op === 'eq') clauses.push(`${col} = ${placeholder}`);
    else if (op === 'neq') clauses.push(`${col} <> ${placeholder}`);
    else if (op === 'gte') clauses.push(`${col} >= ${placeholder}`);
    else if (op === 'lte') clauses.push(`${col} <= ${placeholder}`);
    else if (op === 'ilike') clauses.push(`${col} ILIKE ${placeholder}`);
  }

  if (!clauses.length) return 'TRUE';
  return `(${clauses.join(' OR ')})`;
}

class LocalQueryBuilder implements PromiseLike<{ data: any; error: any; count: number | null }> {
  private table: string;
  private pool: Pool;
  private action: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private columns = '*';
  private selectOptions: SelectOptions = {};
  private payload: any = null;
  private filters: Filter[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitValue: number | null = null;
  private wantSingle = false;
  private wantMaybeSingle = false;
  private onConflict: string | null = null;

  constructor(table: string, pool: Pool) {
    this.table = table;
    this.pool = pool;
  }

  select(columns: string = '*', options: SelectOptions = {}) {
    this.action = this.action === 'insert' || this.action === 'update' || this.action === 'upsert'
      ? this.action
      : 'select';
    this.columns = columns;
    this.selectOptions = options;
    return this;
  }

  insert(payload: any) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload: any) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  upsert(payload: any, options?: { onConflict?: string }) {
    this.action = 'upsert';
    this.payload = payload;
    this.onConflict = options?.onConflict || null;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ type: 'eq', column, value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ type: 'neq', column, value });
    return this;
  }

  in(column: string, values: unknown[]) {
    this.filters.push({ type: 'in', column, values });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push({ type: 'gte', column, value });
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push({ type: 'lte', column, value });
    return this;
  }

  ilike(column: string, value: unknown) {
    this.filters.push({ type: 'ilike', column, value });
    return this;
  }

  or(expression: string) {
    this.filters.push({ type: 'or', expression });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(value: number) {
    this.limitValue = value;
    return this;
  }

  single() {
    this.wantSingle = true;
    this.limitValue = 1;
    return this.execute();
  }

  maybeSingle() {
    this.wantMaybeSingle = true;
    this.limitValue = 1;
    return this.execute();
  }

  then<TResult1 = { data: any; error: any; count: number | null }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }

  private buildWhere(params: unknown[]): string {
    if (!this.filters.length) return '';
    const clauses: string[] = [];
    for (const filter of this.filters) {
      if (filter.type === 'or') {
        clauses.push(parseOrExpression(filter.expression, params));
        continue;
      }
      if (filter.type === 'in') {
        if (!filter.values.length) {
          clauses.push('FALSE');
          continue;
        }
        const placeholders = filter.values.map((v) => {
          params.push(v);
          return `$${params.length}`;
        });
        clauses.push(`${quoteIdent(filter.column)} IN (${placeholders.join(', ')})`);
        continue;
      }
      params.push(filter.value);
      const placeholder = `$${params.length}`;
      const col = quoteIdent(filter.column);
      if (filter.type === 'eq') clauses.push(`${col} = ${placeholder}`);
      if (filter.type === 'neq') clauses.push(`${col} <> ${placeholder}`);
      if (filter.type === 'gte') clauses.push(`${col} >= ${placeholder}`);
      if (filter.type === 'lte') clauses.push(`${col} <= ${placeholder}`);
      if (filter.type === 'ilike') clauses.push(`${col} ILIKE ${placeholder}`);
    }
    return clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  }

  private async execute(): Promise<{ data: any; error: any; count: number | null }> {
    try {
      const result = await this.run();
      return result;
    } catch (error: any) {
      console.error(`[LocalPG] ${this.action} ${this.table} failed:`, error.message);
      return { data: null, error, count: null };
    }
  }

  private async run(): Promise<{ data: any; error: any; count: number | null }> {
    const table = quoteIdent(this.table);
    const params: unknown[] = [];

    if (this.action === 'select') {
      if (this.selectOptions.head && this.selectOptions.count === 'exact') {
        const where = this.buildWhere(params);
        const countRes = await this.pool.query(`SELECT COUNT(*)::int AS count FROM ${table}${where}`, params);
        return { data: null, error: null, count: countRes.rows[0]?.count ?? 0 };
      }

      const { selectSql, embeds } = parseSelectColumns(this.columns);
      const where = this.buildWhere(params);
      let sql = `SELECT ${selectSql} FROM ${table}${where}`;
      if (this.orderBy) {
        sql += ` ORDER BY ${quoteIdent(this.orderBy.column)} ${this.orderBy.ascending ? 'ASC' : 'DESC'}`;
      }
      if (this.limitValue != null) {
        params.push(this.limitValue);
        sql += ` LIMIT $${params.length}`;
      }

      const res = await this.pool.query(sql, params);
      if (embeds.length && res.rows.length) {
        await attachEmbeds(this.pool, this.table, res.rows, embeds);
      }
      return this.finalizeSelect(res);
    }

    if (this.action === 'insert' || this.action === 'upsert') {
      const rows = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted: any[] = [];

      for (const row of rows) {
        const data = { ...row };
        if (!data.id) data.id = randomUUID();
        if (!data.created_at) data.created_at = new Date().toISOString();

        const keys = Object.keys(data);
        const values = keys.map((k) => data[k]);
        const placeholders = keys.map((_, i) => `$${i + 1}`);
        let sql = `INSERT INTO ${table} (${keys.map(quoteIdent).join(', ')}) VALUES (${placeholders.join(', ')})`;

        if (this.action === 'upsert') {
          const conflictCols = (this.onConflict || keys.filter((k) => k !== 'id').slice(0, 1).join(','))
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean);
          const updateCols = keys.filter((k) => !conflictCols.includes(k) && k !== 'id');
          if (conflictCols.length && updateCols.length) {
            sql += ` ON CONFLICT (${conflictCols.map(quoteIdent).join(', ')}) DO UPDATE SET ${updateCols
              .map((c) => `${quoteIdent(c)} = EXCLUDED.${quoteIdent(c)}`)
              .join(', ')}`;
          } else if (conflictCols.length) {
            sql += ` ON CONFLICT (${conflictCols.map(quoteIdent).join(', ')}) DO NOTHING`;
          }
        }

        sql += ' RETURNING *';
        const res = await this.pool.query(sql, values);
        if (res.rows[0]) inserted.push(res.rows[0]);
      }

      if (this.wantSingle || this.wantMaybeSingle || !Array.isArray(this.payload)) {
        if (!inserted[0] && this.wantSingle) {
          return { data: null, error: { message: 'No rows returned', code: 'PGRST116' }, count: null };
        }
        return { data: inserted[0] || null, error: null, count: inserted.length };
      }
      return { data: inserted, error: null, count: inserted.length };
    }

    if (this.action === 'update') {
      const data = { ...this.payload };
      delete data.id;
      const keys = Object.keys(data);
      if (!keys.length) {
        return { data: null, error: { message: 'No columns to update' }, count: null };
      }

      const sets = keys.map((k, i) => {
        params.push(data[k]);
        return `${quoteIdent(k)} = $${i + 1}`;
      });
      const where = this.buildWhere(params);
      const sql = `UPDATE ${table} SET ${sets.join(', ')}${where} RETURNING *`;
      const res = await this.pool.query(sql, params);

      if (this.wantSingle || this.columns) {
        if (!res.rows[0] && this.wantSingle) {
          return { data: null, error: { message: 'No rows updated', code: 'PGRST116' }, count: 0 };
        }
        return {
          data: Array.isArray(this.payload) ? res.rows : (res.rows[0] || null),
          error: null,
          count: res.rowCount,
        };
      }
      return { data: res.rows, error: null, count: res.rowCount };
    }

    if (this.action === 'delete') {
      const where = this.buildWhere(params);
      const sql = `DELETE FROM ${table}${where} RETURNING *`;
      const res = await this.pool.query(sql, params);
      return { data: res.rows, error: null, count: res.rowCount };
    }

    return { data: null, error: { message: `Unsupported action ${this.action}` }, count: null };
  }

  private finalizeSelect(res: QueryResult) {
    if (this.wantSingle) {
      if (!res.rows[0]) {
        return { data: null, error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' }, count: 0 };
      }
      return { data: res.rows[0], error: null, count: 1 };
    }
    if (this.wantMaybeSingle) {
      return { data: res.rows[0] || null, error: null, count: res.rows.length };
    }
    return { data: res.rows, error: null, count: res.rows.length };
  }
}

export function createLocalSupabaseClient(connectionString?: string) {
  const pool = getLocalPool(connectionString);

  return {
    from(table: string) {
      return new LocalQueryBuilder(table, pool);
    },
    channel() {
      return {
        on() {
          return this;
        },
        subscribe() {
          return { unsubscribe() {} };
        },
        unsubscribe() {},
      };
    },
    removeChannel() {},
    removeAllChannels() {},
    auth: {
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe() {} } } };
      },
      getSession() {
        return Promise.resolve({ data: { session: null }, error: null });
      },
    },
    // Expose pool for migrations/scripts
    __pool: pool,
  } as any;
}
