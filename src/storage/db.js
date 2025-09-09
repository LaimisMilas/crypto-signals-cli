import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export async function query(sql, params) {
  const { rows } = await pool.query(sql, params);
  return rows;
}

export default { query };
