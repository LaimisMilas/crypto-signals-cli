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
      { open_time: 1, data: { trend: 'sideways', rsi: 25 } },
      { open_time: 2, data: { trend: 'sideways', rsi: 50 } },
    ])
    .mockResolvedValueOnce([
      { open_time: 1, data: { bullishEngulfing: true } },
      { open_time: 2, data: { bearishEngulfing: true } },
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
      { open_time: 1, data: { price: 90, bbands: { lower: 100, upper: 110 } } },
      { open_time: 2, data: { price: 120, bbands: { lower: 100, upper: 110 } } },
    ])
    .mockResolvedValueOnce([
      { open_time: 1, data: {} },
      { open_time: 2, data: {} },
    ]);
  await signalsGenerate({ symbol: 'ETH', interval: '1m', strategy: 'BBRevert' });
  expect(upsertMock).toHaveBeenCalledWith('ETH', [
    { openTime: 1, signal: 'buy' },
    { openTime: 2, signal: 'sell' },
  ]);
});
