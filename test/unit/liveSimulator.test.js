import { jest } from '@jest/globals';
import { loadFixture } from '../helpers/fixtures.js';

const tradesRepo = { insertTradesPaper: jest.fn(async () => {}) };
const equityRepo = { insertEquityPaper: jest.fn(async () => {}) };

jest.unstable_mockModule('../../src/storage/repos/tradesPaper.js', () => tradesRepo);
jest.unstable_mockModule('../../src/storage/repos/equityPaper.js', () => equityRepo);

const { LiveSimulator } = await import('../../src/core/paper/liveSimulator.js');

test('LiveSimulator processes candles and signals correctly', async () => {
  const candles = loadFixture('SOLUSDT_1m_sample');
  const signals = [null, 'buy', 'sell'];
  const sim = new LiveSimulator({ symbol: 'SOLUSDT', initialBalance: 1000, atrPeriod: 1 });
  for (let i = 0; i < candles.length; i++) {
    await sim.process(candles[i], signals[i] || null);
  }
  expect(tradesRepo.insertTradesPaper).toHaveBeenCalled();
  const trade = tradesRepo.insertTradesPaper.mock.calls[0][1][0];
  expect(trade).toMatchObject({ pnl: 42, status: 'closed' });
  const lastEquityCall = equityRepo.insertEquityPaper.mock.calls.at(-1);
  const equityPoint = lastEquityCall[2][0];
  expect(equityPoint.balance).toBe(1042);
});
