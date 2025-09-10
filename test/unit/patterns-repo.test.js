import { jest } from '@jest/globals';

const query = jest.fn();
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));
const { upsertPatterns } = await import('../../src/storage/repos/patterns.js');

test('inserts row with all pattern flags false', async () => {
  await upsertPatterns('BTC', 1, {});
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into patterns_1m'),
    ['BTC', 1, false, false, false, false]
  );
});
