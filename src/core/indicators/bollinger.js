import { RollingWindow } from '../../utils/math.js';

export function bollinger(closes, period = 20, mult = 2) {
  if (closes.length < period) return null;
  const window = new RollingWindow(period);
  for (const c of closes) window.push(c);
  const mean = window.avg();
  const std = window.std();
  return { middle: mean, upper: mean + mult * std, lower: mean - mult * std };
}
