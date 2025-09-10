import { jest } from '@jest/globals';

const query = jest.fn();
const withTransaction = jest.fn(async (fn) => fn({ query }));
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ withTransaction }));
const { upsertPatterns } = await import('../../src/storage/repos/patterns.js');

test('inserts row with all pattern flags false', async () => {
  await upsertPatterns('BTC', [{ openTime: 1 }]);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into patterns_1m'),
    ['BTC', 1, false, false, false, false]
  );
  const sql = query.mock.calls[0][0];
  expect(sql).toMatch(/on conflict \(symbol, open_time\)/);
});
