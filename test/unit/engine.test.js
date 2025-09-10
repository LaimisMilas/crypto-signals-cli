import { runStrategy } from '../../src/core/signals/engine.js';
import SidewaysReversal from '../../src/core/signals/strategies/SidewaysReversal.js';

test('runStrategy returns buy', () => {
  const ind = { trend: 'flat', hhll: { hh: true, ll: false } };
  const sig = runStrategy(SidewaysReversal, ind);
  expect(sig).toBe('buy');
});
