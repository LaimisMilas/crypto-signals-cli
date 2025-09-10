import { jest } from '@jest/globals';

const query = jest.fn();
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));
const { insertTradesPaper } = await import('../../src/storage/repos/tradesPaper.js');

test('inserts paper trades records', async () => {
  await insertTradesPaper('BTC', [
    {
      entryTime: 1,
      exitTime: 2,
      side: 'long',
      entryPrice: 10,
      exitPrice: 12,
      pnl: 2,
      status: 'closed'
    }
  ]);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into trades_paper'),
    ['BTC', 1, 2, 'long', 1, 10, 12, 2, 'closed']
  );
});
