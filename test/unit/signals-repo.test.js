import { jest } from '@jest/globals';

const query = jest.fn();
const withTransaction = jest.fn(async (fn) => fn({ query }));
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ withTransaction }));
const { upsertSignals } = await import('../../src/storage/repos/signals.js');

test('upserts signals with conflict handling', async () => {
  await upsertSignals('BTC', '1m', 'test', [{ openTime: 1, signal: 'BUY' }]);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into signals'),
    ['BTC', '1m', expect.any(Date), 'test', 'BUY']
  );
  const inserted = query.mock.calls[0][1][2];
  expect(inserted).toEqual(new Date(1));
  const sql = query.mock.calls[0][0];
  expect(sql).toMatch(/on conflict \(symbol, interval, open_time, strategy\) do update set signal = excluded.signal/);
});
