import { runStrategy } from '../../../src/core/signals/engine.js';
import SidewaysReversal from '../../../src/core/signals/strategies/SidewaysReversal.js';

describe('SidewaysReversal strategy', () => {
  test('uses oversoldRsi from config for buy signals', () => {
    const strategy = SidewaysReversal({ oversoldRsi: 25 });
    const buyInd = { trend: 'range', rsi: 24, bullishEngulfing: true };
    const noBuyInd = { trend: 'range', rsi: 26, bullishEngulfing: true };
    expect(runStrategy(strategy, buyInd)).toBe('buy');
    expect(runStrategy(strategy, noBuyInd)).toBeNull();
  });

  test('uses overboughtRsi from config for sell signals', () => {
    const strategy = SidewaysReversal({ overboughtRsi: 65 });
    const sellInd = { trend: 'range', rsi: 66 };
    const noSellInd = { trend: 'range', rsi: 64 };
    expect(runStrategy(strategy, sellInd)).toBe('sell');
    expect(runStrategy(strategy, noSellInd)).toBeNull();
  });

  test('returns sell on bearish engulfing pattern', () => {
    const strategy = SidewaysReversal();
    const ind = { trend: 'range', rsi: 40, bearishEngulfing: true };
    expect(runStrategy(strategy, ind)).toBe('sell');
  });

  test('returns sell when trend breaks range', () => {
    const strategy = SidewaysReversal();
    const ind = { trend: 'up', rsi: 40 };
    expect(runStrategy(strategy, ind)).toBe('sell');
  });
});
