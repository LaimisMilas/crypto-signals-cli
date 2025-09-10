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

export default { query };
