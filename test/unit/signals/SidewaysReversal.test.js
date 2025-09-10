import { runStrategy } from '../../../src/core/signals/engine.js';
import SidewaysReversal from '../../../src/core/signals/strategies/SidewaysReversal.js';

describe('SidewaysReversal strategy', () => {
  test('returns buy on range trend, oversold RSI and bullish engulfing', () => {
    const ind = { trend: 'range', rsi: 20, bullishEngulfing: true };
    expect(runStrategy(SidewaysReversal, ind)).toBe('buy');
  });

  test('returns sell on overbought RSI', () => {
    const ind = { trend: 'range', rsi: 75 };
    expect(runStrategy(SidewaysReversal, ind)).toBe('sell');
  });

  test('returns sell on bearish engulfing pattern', () => {
    const ind = { trend: 'range', rsi: 40, bearishEngulfing: true };
    expect(runStrategy(SidewaysReversal, ind)).toBe('sell');
  });

  test('returns sell when trend breaks range', () => {
    const ind = { trend: 'up', rsi: 40 };
    expect(runStrategy(SidewaysReversal, ind)).toBe('sell');
  });
});
