import { runBacktest } from '../../src/core/backtest/runner.js';

describe('runBacktest long-only', () => {
  test('ignores sell signals when no position is open', async () => {
    const candles = [
      { openTime: 1, high: 1, low: 1, close: 1 },
      { openTime: 2, high: 2, low: 2, close: 2 },
    ];
    const signals = [null, 'sell'];

    const { trades } = await runBacktest({
      candles,
      signals,
      initialBalance: 0,
      atrPeriod: 1,
      atrMultiplier: 2,
    });

    expect(trades).toHaveLength(0);
  });
});

