export default {
  name: 'SidewaysReversal',
  entry(ind) {
    const sideways = ind.trend === 'range';
    const oversold = typeof ind.rsi === 'number' && ind.rsi <= 30;
    if (sideways && oversold && ind.bullishEngulfing) {
      return 'buy';
    }
    return null;
  },
  exit(ind) {
    const notSideways = ind.trend !== 'range';
    const overbought = typeof ind.rsi === 'number' && ind.rsi >= 70;
    if (notSideways || overbought || ind.bearishEngulfing) {
      return 'sell';
    }
    return null;
  }
};
