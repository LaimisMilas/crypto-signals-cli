import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';

jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: jest.fn(async () => [])
}));

const tradesRepo = { insertTradesPaper: jest.fn(async () => {}) };
const equityRepo = { insertEquityPaper: jest.fn(async () => {}) };
jest.unstable_mockModule('../../src/storage/repos/tradesPaper.js', () => tradesRepo);
jest.unstable_mockModule('../../src/storage/repos/equityPaper.js', () => equityRepo);

const { backtestRun } = await import('../../src/cli/backtest.js');

test('backtest generates metrics and files', async () => {
  const candles = [
    { openTime: 1, high: 110, low: 90, close: 100 },
    { openTime: 2, high: 120, low: 99, close: 110 },
    { openTime: 3, high: 115, low: 85, close: 90 },
    { openTime: 4, high: 150, low: 100, close: 140 },
    { openTime: 5, high: 210, low: 130, close: 205 },
  ];
  const signals = [null, 'buy', null, 'buy', null];
  const { metrics } = await backtestRun({
    strategy: 'test',
    symbol: 'BTCUSDT',
    from: 1,
    to: 5,
    interval: '1m',
    initial: 1000,
    candles,
    signals,
    atrPeriod: 1,
    atrMultiplier: 1,
  });

  expect(metrics.winrate).toBeCloseTo(0.5);
  expect(metrics.profitFactor).toBeCloseTo(60 / 21);
  expect(metrics.maxDrawdown).toBeCloseTo(21);
  expect(metrics.avgPnL).toBeCloseTo(19.5);

  const dirName = 'test_BTCUSDT_1m_1_5';
  const outDir = path.join('out', 'backtest', dirName);
  const files = ['trades.csv', 'equity.csv', 'metrics.json', 'config.json'];
  for (const f of files) {
    await expect(fs.access(path.join(outDir, f))).resolves.toBeUndefined();
  }

  await fs.rm(path.join('out', 'backtest', dirName), { recursive: true, force: true });
});
