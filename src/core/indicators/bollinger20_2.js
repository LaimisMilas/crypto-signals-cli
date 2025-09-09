export function bollinger20_2(closes) {
  const period = 20;
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
  const std = Math.sqrt(variance);
  return { middle: mean, upper: mean + 2 * std, lower: mean - 2 * std };
}
