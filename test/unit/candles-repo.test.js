import { jest } from '@jest/globals';

const query = jest.fn();
const withTransaction = jest.fn(async (fn) => fn({ query }));
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ withTransaction }));
const { insertCandles } = await import('../../src/storage/repos/candles.js');

test('uses correct table and upsert logic for candles', async () => {
  await insertCandles('BTC', [{ openTime: 1, open: 2, high: 3, low: 1, close: 2, volume: 10 }], '5m');
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into candles_5m'),
    ['BTC', 1, 2, 3, 1, 2, 10]
  );
  const sql = query.mock.calls[0][0];
  expect(sql).toMatch(/on conflict \(symbol, open_time\) do update/);
});
