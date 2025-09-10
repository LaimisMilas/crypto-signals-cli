export function trend(closes) {
  if (closes.length < 2) return 'flat';
  const first = closes[0];
  const last = closes[closes.length - 1];
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'flat';
}
