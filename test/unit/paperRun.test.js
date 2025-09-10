import { jest } from '@jest/globals';
import { loadFixture } from '../helpers/fixtures.js';

const tradesRepo = { insertTradesPaper: jest.fn(async () => {}) };
const equityRepo = { insertEquityPaper: jest.fn(async () => {}) };

jest.unstable_mockModule('../../src/storage/repos/tradesPaper.js', () => tradesRepo);
jest.unstable_mockModule('../../src/storage/repos/equityPaper.js', () => equityRepo);

const { paperRun } = await import('../../src/cli/paper.js');

test('paperRun executes trade, records equity, and calculates pnl', async () => {
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
  expect(tradesRepo.insertTradesPaper).toHaveBeenCalled();
  expect(equityRepo.insertEquityPaper).toHaveBeenCalled();
  const trades = tradesRepo.insertTradesPaper.mock.calls[0][1];
  expect(trades[0]).toMatchObject({ pnl: 42, status: 'closed' });
  const equity = equityRepo.insertEquityPaper.mock.calls[0][2];
  expect(equity[equity.length - 1].balance).toBe(1042);
  expect(equityRepo.insertEquityPaper.mock.calls[0][0]).toBe('paper');
  expect(equityRepo.insertEquityPaper.mock.calls[0][1]).toBe('SOLUSDT');
});
