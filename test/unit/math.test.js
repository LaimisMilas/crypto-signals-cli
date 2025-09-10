import { trueRange } from '../../src/utils/math.js';

test('trueRange scenarios', () => {
  expect(trueRange(10, 5, 7)).toBe(5);
  expect(trueRange(11, 8, 5)).toBe(6);
  expect(trueRange(10, 4, 12)).toBe(8);
});
