export function bearishEngulfing(c1, c2) {
  return (
    c1.close > c1.open &&
    c2.close < c2.open &&
    c2.open >= c1.close &&
    c2.close <= c1.open
  );
}
