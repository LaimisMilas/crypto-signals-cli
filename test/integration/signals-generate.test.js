import { jest } from '@jest/globals';

const indicators = [
  { open_time: 1, data: { bollinger: { lower: 100, upper: 110 } }, close: 90 },
  { open_time: 2, data: { bollinger: { lower: 100, upper: 110 } }, close: 120 }
];
const patterns = [
  {
    open_time: 1,
    bullish_engulfing: false,
    bearish_engulfing: false,
    hammer: false,
    shooting_star: false,
  },
  {
    open_time: 2,
    bullish_engulfing: false,
    bearish_engulfing: false,
    hammer: false,
    shooting_star: false,
  },
];

jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: jest.fn(async (sql) => {
    if (sql.includes('from indicators_1m')) return indicators;
    if (sql.includes('from patterns_1m')) return patterns;
    return [];
  })
}));

const upsertSignals = jest.fn();
jest.unstable_mockModule('../../src/storage/repos/signals.js', () => ({
  upsertSignals,
}));

const { signalsGenerate } = await import('../../src/cli/signals.js');

it('uses close price for BBRevert strategy', async () => {
  await signalsGenerate({ symbol: 'BTCUSDT', interval: '1m', strategy: 'BBRevert', strategyConfig: '{}' });
  expect(upsertSignals).toHaveBeenCalledWith('BTCUSDT', '1m', 'BBRevert', [
    { openTime: 1, signal: 'buy' },
    { openTime: 2, signal: 'sell' }
  ]);
});
