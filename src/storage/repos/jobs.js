import { query } from '../db.js';

export async function getJobRunAt(name) {
  const rows = await query('select run_at from jobs where name=$1', [name]);
  const r = rows[0]?.run_at;
  return r !== undefined ? Number(r) : null;
}

export async function setJobRunAt(name, runAt) {
  const updated = await query('update jobs set run_at=$2 where name=$1 returning id', [name, runAt]);
  if (updated.length === 0) {
    await query('insert into jobs (name, run_at) values ($1,$2)', [name, runAt]);
  }
}

export default { getJobRunAt, setJobRunAt };
