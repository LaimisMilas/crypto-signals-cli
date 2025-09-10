import { jest } from '@jest/globals';

const queryMock = jest.fn();
const upsertMock = jest.fn();

await jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: queryMock,
}));
await jest.unstable_mockModule('../../src/storage/repos/signals.js', () => ({
  upsertSignals: upsertMock,
}));

const { signalsGenerate } = await import('../../src/cli/signals.js');

beforeEach(() => {
  queryMock.mockReset();
  upsertMock.mockReset();
});

test('generates signals for SidewaysReversal strategy', async () => {
  queryMock
    .mockResolvedValueOnce([
      { open_time: 1, data: { trend: 'sideways', rsi: 20 }, close: 0 },
      { open_time: 2, data: { trend: 'sideways', rsi: 80 }, close: 0 },
    ])
    .mockResolvedValueOnce([
      {
        open_time: 1,
        bullish_engulfing: true,
        bearish_engulfing: false,
        hammer: false,
        shooting_star: false,
      },
      {
        open_time: 2,
        bullish_engulfing: false,
        bearish_engulfing: true,
        hammer: false,
        shooting_star: false,
      },
    ]);
  await signalsGenerate({ symbol: 'BTC', interval: '1m', strategy: 'SidewaysReversal' });
  expect(upsertMock).toHaveBeenCalledWith('BTC', [
    { openTime: 1, signal: 'buy' },
    { openTime: 2, signal: 'sell' },
  ]);
});

test('generates signals for BBRevert strategy', async () => {
  queryMock
    .mockResolvedValueOnce([
      { open_time: 1, data: { bbands: { lower: 100, upper: 110 } }, close: 90 },
      { open_time: 2, data: { bbands: { lower: 100, upper: 110 } }, close: 120 },
    ])
    .mockResolvedValueOnce([
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
    ]);
  await signalsGenerate({ symbol: 'ETH', interval: '1m', strategy: 'BBRevert' });
  expect(upsertMock).toHaveBeenCalledWith('ETH', [
    { openTime: 1, signal: 'buy' },
    { openTime: 2, signal: 'sell' },
  ]);
});
