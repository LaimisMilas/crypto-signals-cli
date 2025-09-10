import { jest } from '@jest/globals';

const query = jest.fn();
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));
const { getJobRunAt, setJobRunAt } = await import('../../src/storage/repos/jobs.js');

beforeEach(() => {
  query.mockReset();
});

test('getJobRunAt returns run time as number', async () => {
  query.mockResolvedValueOnce([{ run_at: '123' }]);
  const result = await getJobRunAt('job1');
  expect(query).toHaveBeenCalledWith('select run_at from jobs where name=$1', ['job1']);
  expect(result).toBe(123);
});

test('getJobRunAt returns null when missing', async () => {
  query.mockResolvedValueOnce([]);
  const result = await getJobRunAt('job2');
  expect(query).toHaveBeenCalledWith('select run_at from jobs where name=$1', ['job2']);
  expect(result).toBeNull();
});

test('setJobRunAt updates existing job', async () => {
  query.mockResolvedValueOnce([{ id: 1 }]);
  await setJobRunAt('job1', 1000);
  expect(query).toHaveBeenCalledWith(
    'update jobs set run_at=$2 where name=$1 returning id',
    ['job1', 1000]
  );
  expect(query).toHaveBeenCalledTimes(1);
});

test('setJobRunAt inserts when job missing', async () => {
  query.mockResolvedValueOnce([]);
  query.mockResolvedValueOnce([]);
  await setJobRunAt('job1', 2000);
  expect(query.mock.calls).toEqual([
    ['update jobs set run_at=$2 where name=$1 returning id', ['job1', 2000]],
    ['insert into jobs (name, run_at) values ($1,$2)', ['job1', 2000]],
  ]);
});
