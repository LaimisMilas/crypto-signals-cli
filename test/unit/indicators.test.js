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
  expect(trend(100, null, 100, 0)).toBe('range');
});

test('trend reflects fresh highs and lows from aroon', () => {
  const bullishHighs = [1, 2, 3, 4, 6];
  const bullishLows = [0, 1, 2, 3, 4];
  const bullishAroon = aroon(bullishHighs, bullishLows, 5);
  expect(trend(110, 100, bullishAroon.up, bullishAroon.down)).toBe('up');

  const bearishHighs = [6, 5, 4, 3, 2];
  const bearishLows = [5, 4, 3, 2, 1];
  const bearishAroon = aroon(bearishHighs, bearishLows, 5);
  expect(trend(90, 100, bearishAroon.up, bearishAroon.down)).toBe('down');
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

test('aroon newest extremes score highest', () => {
  const highs = [1, 2, 3];
  const lows = [3, 2, 1];
  const res = aroon(highs, lows, 3);
  expect(res.up).toBe(100);
  expect(res.down).toBe(100);
});

test('aroon older extremes decay towards zero', () => {
  const highs = [1, 3, 5, 4, 2];
  const lows = [5, 1, 3, 2, 4];
  const res = aroon(highs, lows, 5);
  expect(res.up).toBeCloseTo(50);
  expect(res.down).toBeCloseTo(25);
});

test('bollinger flat', () => {
  const closes = Array(20).fill(5);
  const res = bollinger(closes);
  expect(res.middle).toBe(5);
  expect(res.upper).toBe(5);
  expect(res.lower).toBe(5);
});

