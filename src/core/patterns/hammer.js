export function hammer(c) {
  const body = Math.abs(c.close - c.open);
  const lower = c.open < c.close ? c.open - c.low : c.close - c.low;
  const upper = c.high - Math.max(c.open, c.close);
  return lower >= body * 2 && upper <= body * 0.3;
}
