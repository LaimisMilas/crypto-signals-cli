const strategy = {
  name: 'BBRevert',
  rules: [
    { when: i => i.price < i.bbands.lower, signal: 'buy' },
    { when: i => i.price > i.bbands.upper, signal: 'sell' }
  ]
};

export default strategy;
