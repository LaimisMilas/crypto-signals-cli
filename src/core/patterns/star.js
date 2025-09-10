export function shootingStar(
  c,
  { upperMultiplier = 2, lowerMultiplier = 0.3 } = {}
) {
  const body = Math.abs(c.close - c.open);
  const upper = c.high - Math.max(c.open, c.close);
  const lower = Math.min(c.open, c.close) - c.low;
  return (
    upper >= body * upperMultiplier &&
    lower <= body * lowerMultiplier
  );
}
