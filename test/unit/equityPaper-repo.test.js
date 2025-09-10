import { jest } from '@jest/globals';

const query = jest.fn();
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));
const { insertEquityPaper } = await import('../../src/storage/repos/equityPaper.js');

test('inserts paper equity records', async () => {
  await insertEquityPaper('paper', 'BTC', [{ time: 1, balance: 100 }]);
  expect(query).toHaveBeenCalledWith(
    expect.stringContaining('insert into equity_paper'),
    [1, 100, 'paper', 'BTC']
  );
});
