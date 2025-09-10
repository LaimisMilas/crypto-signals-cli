import { jest } from '@jest/globals';

const fetchMock = jest.fn(async url => {
  const u = new URL(url);
  const start = Number(u.searchParams.get('startTime') || 0);
  const end = Number(u.searchParams.get('endTime'));
  const limit = Number(u.searchParams.get('limit'));
  const candles = [];
  for (let t = start; (!end || t < end) && candles.length < limit; t += 60_000) {
    candles.push([t, '1', '1', '1', '1', '1']);
  }
  return { ok: true, json: async () => candles };
});

jest.unstable_mockModule('node-fetch', () => ({ default: fetchMock }));
const insertMock = jest.fn(async () => {});
jest.unstable_mockModule('../../src/storage/repos/candles.js', () => ({ insertCandles: insertMock }));
const db = { query: jest.fn(async () => []) };
jest.unstable_mockModule('../../src/storage/db.js', () => db);

const { fetchKlinesRange } = await import('../../src/core/binance.js');

test('fetch range in batches', async () => {
  fetchMock.mockClear();
  insertMock.mockClear();
  await fetchKlinesRange({
    symbol: 'BTCUSDT',
    interval: '1m',
    startMs: 0,
    endMs: 1_500 * 60_000,
    limit: 1000
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(insertMock).toHaveBeenCalledTimes(2);
});

test('resume from last stored candle', async () => {
  fetchMock.mockClear();
  insertMock.mockClear();
  db.query.mockResolvedValueOnce([{ m: 60_000 }]);
  await fetchKlinesRange({
    symbol: 'BTCUSDT',
    interval: '1m',
    endMs: 180_000,
    resume: true
  });
  const url = new URL(fetchMock.mock.calls[0][0]);
  expect(url.searchParams.get('startTime')).toBe('120000');
  expect(db.query).toHaveBeenCalled();
});

