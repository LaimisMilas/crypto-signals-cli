import { jest } from '@jest/globals';

const query = jest.fn();
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));
const { insertTrades } = await import('../../src/storage/repos/trades.js');

test('inserts trades records', async () => {
  await insertTrades('BTC', [{ entryTime: 1, exitTime: 2, entryPrice: 10, exitPrice: 12, side: 'LONG', pnl: 2 }]);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into trades'),
    ['BTC', 1, 2, 10, 12, 'LONG', 2]
  );
});
