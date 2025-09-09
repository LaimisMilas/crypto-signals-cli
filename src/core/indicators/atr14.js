export function atr14(highs, lows, closes) {
  const period = 14;
  if (highs.length < period + 1) return null;
  let trs = [];
  for (let i = 1; i < highs.length; i++) {
    const hl = highs[i] - lows[i];
    const hc = Math.abs(highs[i] - closes[i - 1]);
    const lc = Math.abs(lows[i] - closes[i - 1]);
    trs.push(Math.max(hl, hc, lc));
  }
  trs = trs.slice(-period);
  return trs.reduce((a, b) => a + b, 0) / period;
}
