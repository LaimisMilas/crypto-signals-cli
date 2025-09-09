import { bullishEngulfing } from '../src/core/patterns/bullishEngulfing.js';
import { hammer } from '../src/core/patterns/hammer.js';

test('bullish engulfing', () => {
  const c1 = { open: 10, close: 8 };
  const c2 = { open: 7, close: 11 };
  expect(bullishEngulfing(c1, c2)).toBe(true);
});

test('hammer', () => {
  const c = { open: 10, close: 11, high: 12, low: 8 };
  expect(hammer(c)).toBe(true);
});
