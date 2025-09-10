import { rsi } from '../../src/core/indicators/rsi.js';
import { trend } from '../../src/core/indicators/trend.js';
import { hhll } from '../../src/core/indicators/hhll.js';

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

test('hhll', () => {
  const res = hhll([1, 2], [2, 1]);
  expect(res.hh).toBe(true);
  expect(res.ll).toBe(true);
});
