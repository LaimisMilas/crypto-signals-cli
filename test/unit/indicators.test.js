import { rsi } from '../../src/core/indicators/rsi.js';
import { trend } from '../../src/core/indicators/trend.js';
import { hhll } from '../../src/core/indicators/hhll.js';
import { atr } from '../../src/core/indicators/atr.js';
import { aroon } from '../../src/core/indicators/aroon.js';
import { bollinger } from '../../src/core/indicators/bollinger.js';

test('rsi zigzag ~50', () => {
  const closes = Array.from({ length: 30 }, (_, i) => (i % 2 === 0 ? 1 : 2));
  const rsiVal = rsi(closes);
  expect(rsiVal).toBeGreaterThan(40);
  expect(rsiVal).toBeLessThan(60);
});

test('trend up/down/range', () => {
  expect(trend(110, 100, 80, 50)).toBe('up');
  expect(trend(90, 100, 30, 70)).toBe('down');
  expect(trend(100, 100, 50, 50)).toBe('range');
});

test('hhll', () => {
  const res = hhll([1, 2], [2, 1]);
  expect(res.hh).toBe(true);
  expect(res.ll).toBe(true);
});

test('atr constant range', () => {
  const highs = [2, 3, 4, 5];
  const lows = [0, 1, 2, 3];
  const closes = [1, 2, 3, 4];
  const res = atr(highs, lows, closes, 3);
  expect(res).toBeCloseTo(2);
});

test('aroon extremes', () => {
  const highs = [1, 2, 3];
  const lows = [1, 2, 3];
  const res = aroon(highs, lows, 3);
  expect(res.up).toBe(0);
  expect(res.down).toBe(100);
});

test('bollinger flat', () => {
  const closes = Array(20).fill(5);
  const res = bollinger(closes);
  expect(res.middle).toBe(5);
  expect(res.upper).toBe(5);
  expect(res.lower).toBe(5);
});

