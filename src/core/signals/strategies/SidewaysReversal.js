const strategy = {
  name: 'SidewaysReversal',
  rules: [
    { when: i => i.trend === 'flat' && i.hhll.hh, signal: 'buy' },
    { when: i => i.trend === 'flat' && i.hhll.ll, signal: 'sell' }
  ]
};

export default strategy;
