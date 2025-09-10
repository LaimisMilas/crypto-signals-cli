export default {
  name: 'BBRevert',
  rules: [
    { when: i => i.close < i.bbands.lower, signal: 'buy' },
    { when: i => i.close > i.bbands.upper || i.rsi > 70, signal: 'sell' }
  ]
};
