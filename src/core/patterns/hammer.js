export function hammer(
  c,
  { lowerMultiplier = 2, upperMultiplier = 1 } = {}
) {
  const body = Math.abs(c.close - c.open);
  const lowerWick = Math.min(c.open, c.close) - c.low;
  const upperWick = c.high - Math.max(c.open, c.close);
  return (
    lowerWick >= lowerMultiplier * body &&
    upperWick <= upperMultiplier * body
  );
}
