import { RollingWindow, trueRange } from '../../utils/math.js';

export function atr(highs, lows, closes, period = 14) {
  if (highs.length < period + 1) return null;
  const window = new RollingWindow(period);
  for (let i = 1; i < highs.length; i++) {
    window.push(trueRange(highs[i], lows[i], closes[i - 1]));
  }
  return window.avg();
}
