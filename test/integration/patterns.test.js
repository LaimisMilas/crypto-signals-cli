import { jest } from '@jest/globals';
import { loadFixture } from '../helpers/fixtures.js';

const candles = loadFixture('SOLUSDT_1m_sample').map(c => ({
  open_time: c.openTime,
  open: c.open,
  high: c.high,
  low: c.low,
  close: c.close,
}));

const query = jest.fn(async (sql) => {
  if (sql.includes('from candles_1m')) {
    return candles;
  }
  return [];
});
const withTransaction = jest.fn(async (fn) => fn({ query }));

jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query,
  withTransaction,
}));

await import('../../src/storage/db.js');
const { detectPatterns } = await import('../../src/cli/patterns.js');

test('detect patterns and write to db', async () => {
  await detectPatterns({ symbol: 'BTCUSDT' });
  const insertCalls = query.mock.calls.filter((c) =>
    c[0].includes('insert into patterns_1m')
  );
  expect(insertCalls).toHaveLength(candles.length);
  const firstCall = insertCalls.find((c) => c[1][1] === candles[0].open_time);
  expect(firstCall[1].slice(2)).toEqual([false, false, false, false]);
});
