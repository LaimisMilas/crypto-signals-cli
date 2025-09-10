export function shootingStar(c) {
  const body = Math.abs(c.close - c.open);
  const upper = c.high - Math.max(c.open, c.close);
  const lower = Math.min(c.open, c.close) - c.low;
  return upper >= body * 2 && lower <= body * 0.3;
}
