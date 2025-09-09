export function trend(closes) {
  if (closes.length < 2) return 'flat';
  const last = closes[closes.length - 1];
  const prev = closes[closes.length - 2];
  if (last > prev) return 'up';
  if (last < prev) return 'down';
  return 'flat';
}
