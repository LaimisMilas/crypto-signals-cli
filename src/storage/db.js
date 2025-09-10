import pg from 'pg';
const { Pool } = pg;

const cfg = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined,
};

const pool = new Pool(cfg);

export async function query(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const res = await fn(client);
    await client.query('COMMIT');
    return res;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export default { query, withTransaction };
