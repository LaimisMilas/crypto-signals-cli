import { jest } from '@jest/globals';

const query = jest.fn();
const backtestRun = jest.fn(async () => {});
const setJobRunAt = jest.fn(async () => {});

await jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));
await jest.unstable_mockModule('../../src/cli/backtest.js', () => ({ backtestRun }));
await jest.unstable_mockModule('../../src/storage/repos/jobs.js', () => ({ setJobRunAt }));

const { jobsList, jobsRun } = await import('../../src/cli/jobs.js');

beforeEach(() => {
  query.mockReset();
  backtestRun.mockClear();
  setJobRunAt.mockClear();
});

test('jobsList queries jobs with limit', async () => {
  query.mockResolvedValueOnce([{ id: 1, name: 'a', run_at: '10' }]);
  const result = await jobsList({ limit: 5 });
  expect(query).toHaveBeenCalledWith(
    'select id, name, run_at from jobs order by run_at desc limit $1',
    [5]
  );
  expect(result).toEqual([{ id: 1, name: 'a', run_at: '10' }]);
});

test('jobsRun executes job and updates run time', async () => {
  const now = 123456; 
  jest.spyOn(Date, 'now').mockReturnValueOnce(now);
  await jobsRun({ type: 'backtest', params: '{"foo":1}', dryRun: true });
  expect(backtestRun).toHaveBeenCalledWith({ foo: 1, dryRun: true });
  expect(setJobRunAt).toHaveBeenCalledWith('backtest', now);
});
