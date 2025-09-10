import { jest } from '@jest/globals';
import { loadFixture } from '../helpers/fixtures.js';

const query = jest.fn(async () => []);
jest.unstable_mockModule('../../src/storage/db.js', () => ({ query }));

const { paperRun } = await import('../../src/cli/paper.js');

test('paper CLI writes to trades_paper and equity_paper', async () => {
  const candles = loadFixture('SOLUSDT_1m_sample');
  const signals = [null, 'buy', 'sell'];
  await paperRun({
    strategy: 'test',
    symbol: 'SOLUSDT',
    initial: 1000,
    candles,
    signals,
    atrPeriod: 1
  });
  const statements = query.mock.calls.map(c => c[0]);
  expect(statements.some(s => s.includes('insert into trades_paper'))).toBe(true);
  expect(statements.some(s => s.includes('insert into equity_paper'))).toBe(true);
});
