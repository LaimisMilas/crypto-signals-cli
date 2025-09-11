import { jest } from '@jest/globals';

const query = jest.fn();
await jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));
const { insertEquityPaper } = await import('../../src/storage/repos/equityPaper.js');

test('upserts paper equity records', async () => {
  await insertEquityPaper('paper', 'BTC', [{ time: 1, balance: 100 }]);
  expect(query).toHaveBeenCalledTimes(1);
  const [sql, params] = query.mock.calls[0];
  expect(sql).toContain('insert into equity_paper');
  expect(sql.toLowerCase()).toContain('on conflict (ts) do update');
  expect(params).toEqual([1, 100, 'paper', 'BTC']);
});
