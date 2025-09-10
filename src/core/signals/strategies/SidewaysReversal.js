export default {
  name: 'SidewaysReversal',
  entry(ind) {
    if (ind.hhll?.hh && !ind.hhll?.ll) {
      return 'buy';
    }
    return null;
  },
  exit(ind) {
    if (ind.hhll?.ll) {
      return 'sell';
    }
    return null;
  }
};
