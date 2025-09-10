import { jest } from '@jest/globals';

const query = jest.fn();
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));
const { insertEquity } = await import('../../src/storage/repos/equity.js');

test('inserts equity records', async () => {
  await insertEquity('BTC', [{ time: 1, balance: 100 }]);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into equity'),
    ['BTC', 1, 100]
  );
});
