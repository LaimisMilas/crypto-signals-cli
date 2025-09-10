import { bullishEngulfing, bearishEngulfing } from '../../src/core/patterns/engulfing.js';
import { hammer } from '../../src/core/patterns/hammer.js';
import { shootingStar } from '../../src/core/patterns/star.js';

test('bullish engulfing', () => {
  const c1 = { open: 10, close: 8 };
  const c2 = { open: 7, close: 11 };
  expect(bullishEngulfing(c1, c2)).toBe(true);
});

test('bearish engulfing', () => {
  const c1 = { open: 8, close: 10 };
  const c2 = { open: 11, close: 7 };
  expect(bearishEngulfing(c1, c2)).toBe(true);
});

test('bullish engulfing with wicks', () => {
  const c1 = { open: 10, close: 8, high: 11, low: 7 };
  const c2 = { open: 7, close: 11, high: 12, low: 6 };
  expect(bullishEngulfing(c1, c2)).toBe(true);
});

test('bearish engulfing with wicks', () => {
  const c1 = { open: 8, close: 10, high: 11, low: 7 };
  const c2 = { open: 11, close: 7, high: 12, low: 6 };
  expect(bearishEngulfing(c1, c2)).toBe(true);
});

test('hammer', () => {
  const c = { open: 10, close: 11, high: 12, low: 8 };
  expect(hammer(c)).toBe(true);
});

test('hammer with custom ratios', () => {
  const c = { open: 10, close: 11, high: 12, low: 8 };
  expect(hammer(c, { lowerMultiplier: 3 })).toBe(false);
});

test('shooting star', () => {
  const c = { open: 10, close: 9, high: 13, low: 8.9 };
  expect(shootingStar(c)).toBe(true);
});

test('shooting star with custom ratios', () => {
  const c = { open: 10, close: 9, high: 13, low: 8.9 };
  expect(shootingStar(c, { upperMultiplier: 4 })).toBe(false);
});
