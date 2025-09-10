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
  const prevBullish = c1.close > c1.open;
  const currBearish = c2.close < c2.open;
  const prevLow = Math.min(c1.open, c1.close);
  const prevHigh = Math.max(c1.open, c1.close);
  const currLow = Math.min(c2.open, c2.close);
  const currHigh = Math.max(c2.open, c2.close);
  return prevBullish && currBearish && currLow <= prevLow && currHigh >= prevHigh;
}
