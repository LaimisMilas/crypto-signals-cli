import { jest } from '@jest/globals';
import { loadFixture } from '../helpers/fixtures.js';

let serverTimeValue = 0;

const fetchMock = jest.fn(async url => {
  const u = new URL(url);
  if (u.pathname.endsWith('/time')) {
    return { ok: true, json: async () => ({ serverTime: serverTimeValue }) };
  }
  const start = Number(u.searchParams.get('startTime') || 0);
  const end = Number(u.searchParams.get('endTime'));
  const limit = Number(u.searchParams.get('limit'));
  const interval = u.searchParams.get('interval');
  const stepMap = { '1m': 60_000, '1h': 3_600_000, '1d': 86_400_000 };
  const step = stepMap[interval];
  const candles = [];
  for (let t = start; (!end || t < end) && candles.length < limit; t += step) {
    candles.push([t, '1', '1', '1', '1', '1']);
  }
  return { ok: true, json: async () => candles };
});

jest.unstable_mockModule('node-fetch', () => ({ default: fetchMock }));
const insertMock = jest.fn(async () => {});
jest.unstable_mockModule('../../src/storage/repos/candles.js', () => ({ insertCandles: insertMock }));
const db = { query: jest.fn(async () => []) };
jest.unstable_mockModule('../../src/storage/db.js', () => db);
const jobStore = { ts: undefined };
const getJobRunAtMock = jest.fn(async name => {
  if (jobStore.ts !== undefined) return jobStore.ts;
  const rows = await db.query('select run_at from jobs where name=$1', [name]);
  const r = rows[0]?.run_at;
  return r !== undefined ? Number(r) : null;
});
const setJobRunAtMock = jest.fn(async (_name, ts) => {
  jobStore.ts = ts;
});
jest.unstable_mockModule('../../src/storage/repos/jobs.js', () => ({
  getJobRunAt: getJobRunAtMock,
  setJobRunAt: setJobRunAtMock
}));

const { fetchKlinesRange, syncServerTime, getServerTime } = await import('../../src/core/binance.js');

test('fetch range in batches', async () => {
  jobStore.ts = undefined;
  fetchMock.mockClear();
  insertMock.mockClear();
  getJobRunAtMock.mockClear();
  setJobRunAtMock.mockClear();
  await fetchKlinesRange({
    symbol: 'BTCUSDT',
    interval: '1m',
    startMs: 0,
    endMs: 1_500 * 60_000,
    limit: 1000
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(insertMock).toHaveBeenCalledTimes(2);
  expect(insertMock.mock.calls[0][0]).toBe('BTCUSDT');
  expect(insertMock.mock.calls[0][2]).toBe('1m');
});

test('updates job progress before each batch and after completion', async () => {
  jobStore.ts = undefined;
  fetchMock.mockClear();
  insertMock.mockClear();
  setJobRunAtMock.mockClear();

  await fetchKlinesRange({
    symbol: 'BTCUSDT',
    interval: '1m',
    startMs: 0,
    endMs: 1_500 * 60_000,
    limit: 1000
  });

  // two batches => setJobRunAt called before each batch and once at the end
  expect(setJobRunAtMock).toHaveBeenCalledTimes(3);

  // first batch starts at 0
  expect(setJobRunAtMock.mock.calls[0][1]).toBe(0);
  expect(setJobRunAtMock.mock.invocationCallOrder[0]).toBeLessThan(
    fetchMock.mock.invocationCallOrder[0]
  );

  // second batch starts at 60_000_000
  expect(setJobRunAtMock.mock.calls[1][1]).toBe(60_000_000);
  expect(setJobRunAtMock.mock.invocationCallOrder[1]).toBeLessThan(
    fetchMock.mock.invocationCallOrder[1]
  );

  // final call stores last processed openTime + step
  expect(setJobRunAtMock.mock.calls[2][1]).toBe(90_000_000);
  expect(jobStore.ts).toBe(90_000_000);
});

test('resume from job entry', async () => {
  jobStore.ts = undefined;
  fetchMock.mockClear();
  insertMock.mockClear();
  db.query.mockReset();
  db.query.mockResolvedValueOnce([{ run_at: 60_000 }]);
  await fetchKlinesRange({
    symbol: 'BTCUSDT',
    interval: '1m',
    endMs: 180_000,
    resume: true
  });
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.searchParams.get('startTime')).toBe('120000');
  expect(db.query).toHaveBeenCalledTimes(1);
  expect(db.query.mock.calls[0][0]).toMatch(/jobs/);
});

test('resume from candles when job missing', async () => {
  jobStore.ts = undefined;
  fetchMock.mockClear();
  insertMock.mockClear();
  db.query.mockReset();
  getJobRunAtMock.mockClear();
  const last = 3_600_000;
  db.query
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ m: last }]);
  await fetchKlinesRange({
    symbol: 'BTCUSDT',
    interval: '1h',
    endMs: 10 * 3_600_000,
    resume: true
  });
  expect(db.query.mock.calls[1][0]).toMatch(/candles_1h/);
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.searchParams.get('startTime')).toBe(String(last + 3_600_000));
});

test('resume after crash using job progress', async () => {
  jobStore.ts = undefined;
  fetchMock.mockClear();
  insertMock.mockReset();
  getJobRunAtMock.mockClear();
  setJobRunAtMock.mockClear();
  // first run: insert first batch then fail
  insertMock
    .mockImplementationOnce(async () => {})
    .mockImplementationOnce(async () => {
      throw new Error('boom');
    });
  await expect(
    fetchKlinesRange({
      symbol: 'BTCUSDT',
      interval: '1m',
      startMs: 0,
      endMs: 2_000 * 60_000,
      limit: 1000
    })
  ).rejects.toThrow('boom');
  expect(jobStore.ts).toBe(60_000_000);

  // second run should resume from stored job timestamp
  insertMock.mockReset();
  insertMock.mockResolvedValue(undefined);
  fetchMock.mockClear();
  await fetchKlinesRange({
    symbol: 'BTCUSDT',
    interval: '1m',
    endMs: 2_000 * 60_000,
    limit: 1000,
    resume: true
  });
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.searchParams.get('startTime')).toBe('60060000');
});

test('supports multiple intervals', async () => {
  fetchMock.mockClear();
  insertMock.mockClear();
  await fetchKlinesRange({
    symbol: 'BTCUSDT',
    interval: '1h',
    startMs: 0,
    endMs: 3 * 3_600_000,
    limit: 1000
  });
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.searchParams.get('interval')).toBe('1h');
  expect(insertMock.mock.calls[0][2]).toBe('1h');
});

test('syncs server time', async () => {
  fetchMock.mockClear();
  serverTimeValue = 1000;
  const spy = jest.spyOn(Date, 'now').mockReturnValue(500);
  await syncServerTime();
  expect(fetchMock.mock.calls[0][0].toString()).toContain('/api/v3/time');
  expect(getServerTime()).toBe(1000);
  spy.mockRestore();
});

test('retries on rate limit and network errors', async () => {
  fetchMock.mockReset();
  insertMock.mockClear();
  const sampleCandles = loadFixture('SOLUSDT_1m_sample').map(c => [
    c.openTime,
    String(c.open),
    String(c.high),
    String(c.low),
    String(c.close),
    String(c.volume)
  ]);
  fetchMock
    .mockImplementationOnce(async () => ({ ok: false, status: 429 }))
    .mockImplementationOnce(async () => { throw new Error('network'); })
    .mockImplementation(async () => ({
      ok: true,
      json: async () => sampleCandles,
    }));
  await fetchKlinesRange({ symbol: 'BTCUSDT', interval: '1m', endMs: 60_000 });
  expect(fetchMock).toHaveBeenCalledTimes(3);
  expect(insertMock).toHaveBeenCalledTimes(1);
});
