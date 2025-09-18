import { RollingWindow } from '../../utils/math.js';

export function aroon(highs, lows, period = 25) {
  if (highs.length < period) return null;

  const highWindow = new RollingWindow(period);
  const lowWindow = new RollingWindow(period);

  for (let i = 0; i < highs.length; i++) {
    highWindow.push(highs[i]);
    lowWindow.push(lows[i]);
  }

  const denominator = period - 1;
  if (denominator === 0) {
    return { up: 100, down: 100 };
  }

  const upAge = highWindow.maxAge();
  const downAge = lowWindow.minAge();

  if (upAge == null || downAge == null) return null;

  const up = ((denominator - upAge) / denominator) * 100;
  const down = ((denominator - downAge) / denominator) * 100;

  return {
    up: Math.max(0, Math.min(100, up)),
    down: Math.max(0, Math.min(100, down)),
  };
}
