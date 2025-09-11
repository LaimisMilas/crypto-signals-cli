import { jest } from '@jest/globals';
import { loadFixture } from '../helpers/fixtures.js';

const queryMock = jest.fn();
await jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: queryMock,
}));

const tradesRepo = { insertTradesPaper: jest.fn(async () => {}) };
const equityRepo = { insertEquityPaper: jest.fn(async () => {}) };
await jest.unstable_mockModule('../../src/storage/repos/tradesPaper.js', () => tradesRepo);
await jest.unstable_mockModule('../../src/storage/repos/equityPaper.js', () => equityRepo);

const { backtestRun } = await import('../../src/cli/backtest.js');

test('backtest runs using DB data', async () => {
  const candles = loadFixture('SOLUSDT_1m_sample');
  queryMock
    .mockResolvedValueOnce(
      candles.map(c => ({
        open_time: c.openTime,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    )
    .mockResolvedValueOnce([{ open_time: 2, signal: 'buy' }]);

  await backtestRun({
    strategy: 'test',
    symbol: 'BTCUSDT',
    from: 1,
    to: 3,
    interval: '1m',
    initial: 1000,
    atrPeriod: 1,
  });

  expect(queryMock).toHaveBeenCalledTimes(2);
  expect(queryMock.mock.calls[0][0]).toMatch(/candles_1m/);
  expect(queryMock.mock.calls[1][0]).toMatch(/signals/);
  expect(queryMock.mock.calls[1][1][2]).toBe('1m');
  expect(tradesRepo.insertTradesPaper).toHaveBeenCalled();
  expect(equityRepo.insertEquityPaper).toHaveBeenCalled();
  expect(tradesRepo.insertTradesPaper.mock.calls[0][1].length).toBeGreaterThan(0);
  expect(equityRepo.insertEquityPaper.mock.calls[0][2].length).toBeGreaterThan(0);
});
