export function bullishEngulfing(prev, curr) {
  const prevBearish = prev.close < prev.open;
  const currBullish = curr.close > curr.open;
  const prevLow = Math.min(prev.open, prev.close);
  const prevHigh = Math.max(prev.open, prev.close);
  const currLow = Math.min(curr.open, curr.close);
  const currHigh = Math.max(curr.open, curr.close);
  return prevBearish && currBullish && currLow <= prevLow && currHigh >= prevHigh;
}
