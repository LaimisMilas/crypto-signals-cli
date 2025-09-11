import { query } from '../storage/db.js';
import { setJobRunAt } from '../storage/repos/jobs.js';
import { backtestRun } from './backtest.js';
import logger from '../utils/logger.js';

const jobHandlers = {
  backtest: backtestRun,
};

export async function jobsList(opts) {
  const { limit = 10 } = opts;
  const rows = await query(
    'select id, name, run_at from jobs order by run_at desc limit $1',
    [Number(limit)]
  );
  for (const r of rows) {
    logger.info(`${r.id} ${r.name} ${r.run_at}`);
  }
  return rows;
}

export async function jobsRun(opts) {
  const { type, params, ...rest } = opts;
  const handler = jobHandlers[type];
  if (!handler) throw new Error(`Unsupported job type: ${type}`);
  const parsed = params ? JSON.parse(params) : {};
  await handler({ ...parsed, ...rest });
  await setJobRunAt(type, Date.now());
  logger.info(`job ${type} completed`);
}

export default { jobsList, jobsRun };
