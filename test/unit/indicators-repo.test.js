import { jest } from '@jest/globals';

const query = jest.fn();
const withTransaction = jest.fn(async (fn) => fn({ query }));
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ withTransaction }));
const { upsertIndicators } = await import('../../src/storage/repos/indicators.js');

test('upserts indicators with conflict handling', async () => {
  const data = { rsi: 30 };
  await upsertIndicators('BTC', [{ openTime: 1, data }]);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into indicators_1m'),
    ['BTC', 1, data]
  );
  const sql = query.mock.calls[0][0];
  expect(sql).toMatch(/on conflict \(symbol, open_time\) do update set data=\$3/);
});
