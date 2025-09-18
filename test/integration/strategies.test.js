import { jest } from '@jest/globals';
import { loadFixture } from '../helpers/fixtures.js';

const queryMock = jest.fn();
const upsertMock = jest.fn();

await jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: queryMock,
}));
await jest.unstable_mockModule('../../src/storage/repos/signals.js', () => ({
  upsertSignals: upsertMock,
}));

const { signalsGenerate } = await import('../../src/cli/signals.js');
const { runBacktest } = await import('../../src/core/backtest/runner.js');

describe('signals generation and backtest integration', () => {
  beforeEach(() => {
    queryMock.mockReset();
    upsertMock.mockReset();
  });

  test('SidewaysReversal generates signals and backtest produces trades', async () => {
    queryMock
        .mockResolvedValueOnce([
          { open_time: 1, data: { trend: 'range', rsi: 50 }, close: 0 },
          { open_time: 2, data: { trend: 'range', rsi: 20 }, close: 0 },
          { open_time: 3, data: { trend: 'up', rsi: 80 }, close: 0 },
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
          bullish_engulfing: true,
          bearish_engulfing: false,
          hammer: false,
          shooting_star: false,
        },
        {
          open_time: 3,
          bullish_engulfing: false,
          bearish_engulfing: false,
          hammer: false,
          shooting_star: false,
        },
      ]);

    await signalsGenerate({ symbol: 'BTC', interval: '1m', strategy: 'SidewaysReversal', strategyConfig: '{}' });
    expect(upsertMock).toHaveBeenCalledWith('BTC', '1m', 'SidewaysReversal', [
      { openTime: 2, signal: 'buy' },
      { openTime: 3, signal: 'sell' },
    ]);

    const candles = loadFixture('SOLUSDT_1m_sample').map(c => ({
      openTime: c.openTime,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const generated = upsertMock.mock.calls[0][3];
    const signals = candles.map(c => {
      const s = generated.find(g => g.openTime === c.openTime);
      return s ? s.signal : null;
    });

    const { trades, equity } = await runBacktest({
      candles,
      signals,
      initialBalance: 1000,
      atrPeriod: 1,
      atrMultiplier: 2,
    });

    expect(trades.length).toBeGreaterThan(0);
    expect(equity.length).toBe(candles.length);
  });

  test('BBRevert generates signals and backtest produces trades', async () => {
    queryMock
      .mockResolvedValueOnce([
        { open_time: 1, data: { price: 100, bollinger: { lower: 90, upper: 110 } }, close: 100 },
        { open_time: 2, data: { price: 80, bollinger: { lower: 90, upper: 110 } }, close: 80 },
        { open_time: 3, data: { price: 120, bollinger: { lower: 90, upper: 110 } }, close: 120 },
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
        {
          open_time: 3,
          bullish_engulfing: false,
          bearish_engulfing: false,
          hammer: false,
          shooting_star: false,
        },
      ]);

    await signalsGenerate({ symbol: 'ETH', interval: '1m', strategy: 'BBRevert', strategyConfig: '{}' });
    expect(upsertMock).toHaveBeenCalledWith('ETH', '1m', 'BBRevert', [
      { openTime: 2, signal: 'buy' },
      { openTime: 3, signal: 'sell' },
    ]);

    const candles = loadFixture('SOLUSDT_1m_sample').map(c => ({
      openTime: c.openTime,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const generated = upsertMock.mock.calls[0][3];
    const signals = candles.map(c => {
      const s = generated.find(g => g.openTime === c.openTime);
      return s ? s.signal : null;
    });

    const { trades, equity } = await runBacktest({
      candles,
      signals,
      initialBalance: 1000,
      atrPeriod: 1,
      atrMultiplier: 2,
    });

    expect(trades.length).toBeGreaterThan(0);
    expect(equity.length).toBe(candles.length);
  });

  test('ignores sell signals when not in position', async () => {
    queryMock
      .mockResolvedValueOnce([
        { open_time: 1, data: { trend: 'up', rsi: 80 }, close: 0 },
        { open_time: 2, data: { trend: 'range', rsi: 20 }, close: 0 },
        { open_time: 3, data: { trend: 'up', rsi: 80 }, close: 0 },
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
          bullish_engulfing: true,
          bearish_engulfing: false,
          hammer: false,
          shooting_star: false,
        },
        {
          open_time: 3,
          bullish_engulfing: false,
          bearish_engulfing: false,
          hammer: false,
          shooting_star: false,
        },
      ]);

    await signalsGenerate({ symbol: 'BTC', interval: '1m', strategy: 'SidewaysReversal', strategyConfig: '{}' });
    expect(upsertMock).toHaveBeenCalledWith('BTC', '1m', 'SidewaysReversal', [
      { openTime: 2, signal: 'buy' },
      { openTime: 3, signal: 'sell' },
    ]);
  });

  test('produces buy then sell for entry/exit sequence', async () => {
    queryMock
      .mockResolvedValueOnce([
        { open_time: 1, data: { trend: 'range', rsi: 20 }, close: 0 },
        { open_time: 2, data: { trend: 'up', rsi: 80 }, close: 0 },
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
          bearish_engulfing: false,
          hammer: false,
          shooting_star: false,
        },
      ]);

    await signalsGenerate({ symbol: 'BTC', interval: '1m', strategy: 'SidewaysReversal', strategyConfig: '{}' });
    expect(upsertMock).toHaveBeenCalledWith('BTC', '1m', 'SidewaysReversal', [
      { openTime: 1, signal: 'buy' },
      { openTime: 2, signal: 'sell' },
    ]);
  });
});
