const strategy = {
  name: 'BBRevert',
  rules: [
    { when: i => i.close < i.bbands.lower, signal: 'buy' },
    { when: i => i.close > i.bbands.upper, signal: 'sell' }
  ]
};

export default strategy;
