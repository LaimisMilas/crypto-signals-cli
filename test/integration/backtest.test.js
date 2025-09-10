import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: jest.fn(async () => [])
}));

const tradesRepo = { insertTrades: jest.fn(async () => {}) };
const equityRepo = { insertEquity: jest.fn(async () => {}) };
jest.unstable_mockModule('../../src/storage/repos/trades.js', () => tradesRepo);
jest.unstable_mockModule('../../src/storage/repos/equity.js', () => equityRepo);

const { backtestRun } = await import('../../src/cli/backtest.js');

test('backtest inserts trade and equity', async () => {
  const candles = [
    { openTime: 0, open: 100, high: 110, low: 90, close: 100 },
    { openTime: 1, open: 100, high: 120, low: 99, close: 110 },
    { openTime: 2, open: 110, high: 160, low: 100, close: 150 }
  ];
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
