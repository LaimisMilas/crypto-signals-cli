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

test('trend up/down', () => {
  expect(trend([1, 2])).toBe('up');
  expect(trend([2, 1])).toBe('down');
});

test('hhll higher high & higher low', () => {
  const highs = [5,6,7,9,7,6,5,7,8,10,8,7,6,8,11,9,8,10,12,11,13,14,15,16,17,18,19,20,21,22];
  const lows =  [1,2,3,4,3,2,1,3,4,5,4,3,2,4,5,6,5,6,7,6,8,9,10,11,12,13,14,15,16,17];
  expect(hhll(highs, lows)).toBe('HH');
});

test('hhll lower high & lower low', () => {
  const highs = [5,6,7,9,7,6,5,7,8,10,8,7,6,8,11,9,8,10,12,11,13,14,15,16,17,18,19,20,21,22].reverse();
  const lows =  [1,2,3,4,3,2,1,3,4,5,4,3,2,4,5,6,5,6,7,6,8,9,10,11,12,13,14,15,16,17].reverse();
  expect(hhll(highs, lows)).toBe('LL');
});

test('hhll insufficient data', () => {
  expect(hhll([1, 2], [2, 1])).toBe('N/A');
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

