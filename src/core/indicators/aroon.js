import { RollingWindow } from '../../utils/math.js';

export function aroon(highs, lows, period = 25) {
  if (highs.length < period) return null;

  const highWindow = new RollingWindow(period);
  const lowWindow = new RollingWindow(period);

  for (let i = 0; i < highs.length; i++) {
    highWindow.push(highs[i]);
    lowWindow.push(lows[i]);
  }

  const up = (highWindow.maxAge() / (period - 1)) * 100;
  const down = (lowWindow.minAge() / (period - 1)) * 100;

  return { up, down };
}
