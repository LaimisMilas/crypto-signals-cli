export default {
  name: 'BBRevert',
  entry(ind) {
    if (ind.close < ind.bollinger?.lower && ind.aroon?.up > 50) {
      return 'buy';
    }
    return null;
  },
  exit(ind) {
    if (ind.close > ind.bollinger?.upper || ind.rsi > 70) {
      return 'sell';
    }
    return null;
  }
};
