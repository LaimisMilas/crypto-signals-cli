import { jest } from '@jest/globals';
import { loadFixture } from '../helpers/fixtures.js';

jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: jest.fn(async () => [])
}));

const tradesRepo = { insertTrades: jest.fn(async () => {}) };
const equityRepo = { insertEquity: jest.fn(async () => {}) };
jest.unstable_mockModule('../../src/storage/repos/trades.js', () => tradesRepo);
jest.unstable_mockModule('../../src/storage/repos/equity.js', () => equityRepo);

const { backtestRun } = await import('../../src/cli/backtest.js');

test('backtest inserts trade and equity', async () => {
  const candles = loadFixture('SOLUSDT_1m_sample');
  const signals = [null, 'buy', null];
  await backtestRun({
    strategy: 'test',
    symbol: 'BTCUSDT',
    from: 0,
    to: 0,
    initial: 1000,
    candles,
    signals,
    atrPeriod: 1
  });
  expect(tradesRepo.insertTrades).toHaveBeenCalled();
  expect(equityRepo.insertEquity).toHaveBeenCalled();
  expect(tradesRepo.insertTrades.mock.calls[0][1].length).toBeGreaterThan(0);
  expect(equityRepo.insertEquity.mock.calls[0][1].length).toBeGreaterThan(0);
});
