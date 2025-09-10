export function hhll(highs, lows) {
  if (highs.length < 2 || lows.length < 2) {
    return { hh: false, hl: false, lh: false, ll: false };
  }
  const [prevHigh, currHigh] = highs.slice(-2);
  const [prevLow, currLow] = lows.slice(-2);
  return {
    hh: currHigh > prevHigh,
    hl: currLow > prevLow,
    lh: currHigh < prevHigh,
    ll: currLow < prevLow
  };
}
