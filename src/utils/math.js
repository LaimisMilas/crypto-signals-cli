export function sma(values) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function ema(values, period) {
  const k = 2 / (period + 1);
  return values.reduce((prev, curr, idx) => (idx === 0 ? curr : curr * k + prev * (1 - k)));
}

export function stdev(values) {
  const mean = sma(values);
  const variance = sma(values.map(v => (v - mean) ** 2));
  return Math.sqrt(variance);
}

export function rolling(values, window, fn) {
  const result = [];
  for (let i = window; i <= values.length; i++) {
    result.push(fn(values.slice(i - window, i)));
  }
  return result;
}
