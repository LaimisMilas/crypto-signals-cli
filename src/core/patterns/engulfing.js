export function bullishEngulfing(prev, curr) {
  const prevBearish = prev.close < prev.open;
  const currBullish = curr.close > curr.open;
  const prevLow = Math.min(prev.open, prev.close);
  const prevHigh = Math.max(prev.open, prev.close);
  const currLow = Math.min(curr.open, curr.close);
  const currHigh = Math.max(curr.open, curr.close);
  return prevBearish && currBullish && currLow <= prevLow && currHigh >= prevHigh;
}

export function bearishEngulfing(c1, c2) {
  return (
    c1.close > c1.open &&
    c2.close < c2.open &&
    c2.open >= c1.close &&
    c2.close <= c1.open
  );
}
