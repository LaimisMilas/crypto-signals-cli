import { jest } from '@jest/globals';

const queryMock = jest.fn();
const upsertMock = jest.fn();

await jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: queryMock,
}));
await jest.unstable_mockModule('../../src/storage/repos/signals.js', () => ({
  upsertSignals: upsertMock,
}));

const { signalsGenerate } = await import('../../src/cli/signals.js');
const { runBacktest } = await import('../../src/core/backtest/runner.js');

describe('signals generation and backtest integration', () => {
  beforeEach(() => {
    queryMock.mockReset();
    upsertMock.mockReset();
  });

  test('SidewaysReversal generates signals and backtest produces trades', async () => {
    queryMock
      .mockResolvedValueOnce([
        { open_time: 1, data: { trend: 'range', rsi: 40 }, close: 100 },
        { open_time: 2, data: { trend: 'range', rsi: 20 }, close: 100 },
        { open_time: 3, data: { trend: 'up', rsi: 40 }, close: 100 },
      ])
      .mockResolvedValueOnce([
        { open_time: 1, data: {} },
        { open_time: 2, data: { bullishEngulfing: true } },
        { open_time: 3, data: {} },
      ]);

    await signalsGenerate({ symbol: 'BTC', interval: '1m', strategy: 'SidewaysReversal' });
    expect(upsertMock).toHaveBeenCalledWith('BTC', [
      { openTime: 2, signal: 'buy' },
      { openTime: 3, signal: 'sell' },
    ]);

    const candles = [
      { openTime: 1, high: 110, low: 90, close: 100 },
      { openTime: 2, high: 120, low: 95, close: 110 },
      { openTime: 3, high: 130, low: 100, close: 120 },
    ];

    const generated = upsertMock.mock.calls[0][1];
    const signals = candles.map(c => {
      const s = generated.find(g => g.openTime === c.openTime);
      return s ? s.signal : null;
    });

    const { trades, equity } = await runBacktest({
      candles,
      signals,
      initialBalance: 1000,
      atrPeriod: 1,
      atrMultiplier: 2,
    });

    expect(trades.length).toBeGreaterThan(0);
    expect(equity.length).toBe(candles.length);
  });

  test('BBRevert generates signals and backtest produces trades', async () => {
    queryMock
      .mockResolvedValueOnce([
        { open_time: 1, data: { bbands: { lower: 90, upper: 110 } }, close: 100 },
        { open_time: 2, data: { bbands: { lower: 90, upper: 110 } }, close: 80 },
        { open_time: 3, data: { bbands: { lower: 90, upper: 110 } }, close: 120 },
      ])
      .mockResolvedValueOnce([
        { open_time: 1, data: {} },
        { open_time: 2, data: {} },
        { open_time: 3, data: {} },
      ]);

    await signalsGenerate({ symbol: 'ETH', interval: '1m', strategy: 'BBRevert' });
    expect(upsertMock).toHaveBeenCalledWith('ETH', [
      { openTime: 2, signal: 'buy' },
      { openTime: 3, signal: 'sell' },
    ]);

    const candles = [
      { openTime: 1, high: 110, low: 90, close: 100 },
      { openTime: 2, high: 100, low: 70, close: 80 },
      { openTime: 3, high: 130, low: 110, close: 120 },
    ];

    const generated = upsertMock.mock.calls[0][1];
    const signals = candles.map(c => {
      const s = generated.find(g => g.openTime === c.openTime);
      return s ? s.signal : null;
    });

    const { trades, equity } = await runBacktest({
      candles,
      signals,
      initialBalance: 1000,
      atrPeriod: 1,
      atrMultiplier: 2,
    });

    expect(trades.length).toBeGreaterThan(0);
    expect(equity.length).toBe(candles.length);
  });
});
