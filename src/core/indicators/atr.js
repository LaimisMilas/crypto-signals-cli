import { RollingWindow } from '../../utils/math.js';

export function atr(highs, lows, closes, period = 14) {
  if (highs.length < period + 1) return null;
  const window = new RollingWindow(period);
  for (let i = 1; i < highs.length; i++) {
    const hl = highs[i] - lows[i];
    const hc = Math.abs(highs[i] - closes[i - 1]);
    const lc = Math.abs(lows[i] - closes[i - 1]);
    window.push(Math.max(hl, hc, lc));
  }
  return window.avg();
}
