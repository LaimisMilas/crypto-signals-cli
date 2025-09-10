import { runStrategy } from '../../src/core/signals/engine.js';
import SidewaysReversal from '../../src/core/signals/strategies/SidewaysReversal.js';

test('runStrategy returns buy', () => {
  const ind = { trend: 'sideways', rsi: 20, bullishEngulfing: true };
  const sig = runStrategy(SidewaysReversal, ind);
  expect(sig).toBe('buy');
});
