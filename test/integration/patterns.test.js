import { jest } from '@jest/globals';

const candles = [
  { open_time: 1, open: 10, high: 12, low: 8, close: 8 },
  { open_time: 2, open: 7, high: 12, low: 6, close: 11 },
  { open_time: 3, open: 10, high: 11, low: 9, close: 10 },
];

jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: jest.fn(async (sql) => {
    if (sql.includes('from candles_1m')) {
      return candles;
    }
    return [];
  })
}));

const db = await import('../../src/storage/db.js');
const { detectPatterns } = await import('../../src/cli/patterns.js');

test('detect patterns and write to db', async () => {
  await detectPatterns({ symbol: 'BTCUSDT' });
  const insertCalls = db.query.mock.calls.filter((c) =>
    c[0].includes('insert into patterns_1m')
  );
  expect(insertCalls).toHaveLength(candles.length);
  const firstCall = insertCalls.find((c) => c[1][1] === candles[0].open_time);
  expect(firstCall[1].slice(2)).toEqual([false, false, false, false]);
});
