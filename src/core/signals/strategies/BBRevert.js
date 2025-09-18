export default {
  name: 'BBRevert',
  rules: [
    {
      when: i => {
        const lower = i.bollinger?.lower;
        return typeof lower === 'number' && i.close < lower;
      },
      signal: 'buy',
    },
    {
      when: i => {
        const upper = i.bollinger?.upper;
        const closeAboveUpper = typeof upper === 'number' && i.close > upper;
        return closeAboveUpper || i.rsi > 70;
      },
      signal: 'sell',
    }
  ]
};
