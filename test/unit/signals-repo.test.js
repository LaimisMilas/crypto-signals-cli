import { jest } from '@jest/globals';

const query = jest.fn();
const withTransaction = jest.fn(async (fn) => fn({ query }));
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ withTransaction }));
const { upsertSignals } = await import('../../src/storage/repos/signals.js');

test('upserts signals with conflict handling', async () => {
  await upsertSignals('BTC', [{ openTime: 1, signal: 'BUY' }]);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into signals'),
    ['BTC', 1, 'BUY']
  );
  const sql = query.mock.calls[0][0];
  expect(sql).toMatch(/on conflict \(symbol, open_time\) do update set signal = excluded.signal/);
});
