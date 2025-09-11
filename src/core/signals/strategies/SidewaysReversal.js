export default function SidewaysReversal({ oversoldRsi = 30, overboughtRsi = 70 } = {}) {
  return {
    name: 'SidewaysReversal',
    entry(ind) {
      const sideways = ind.trend === 'range';
      const oversold = typeof ind.rsi === 'number' && ind.rsi <= oversoldRsi;
      if (sideways && oversold && ind.bullishEngulfing) {
        return 'buy';
      }
      return null;
    },
    exit(ind) {
      const notSideways = ind.trend !== 'range';
      const overbought = typeof ind.rsi === 'number' && ind.rsi >= overboughtRsi;
      if (notSideways || overbought || ind.bearishEngulfing) {
        return 'sell';
      }
      return null;
    },
  };
}
