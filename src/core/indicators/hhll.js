export function hhll(highs, lows) {
  if (highs.length < 2 || lows.length < 2) return { hh: false, ll: false };
  const hh = highs[highs.length - 1] > highs[highs.length - 2];
  const ll = lows[lows.length - 1] < lows[lows.length - 2];
  return { hh, ll };
}
