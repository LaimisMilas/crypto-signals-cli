import { jest } from '@jest/globals';

const query = jest.fn();
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));
const { insertTradesPaper } = await import('../../src/storage/repos/tradesPaper.js');

test('inserts paper trades records', async () => {
  await insertTradesPaper('BTC', [{ entryTime: 1, entryPrice: 10 }]);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into trades_paper'),
    ['BTC', 1, 1, 10]
  );
});
