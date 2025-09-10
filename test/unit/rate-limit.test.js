import { jest } from '@jest/globals';

const realNow = Date.now();

describe('rate limit', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(1_000_000);
  });

  afterEach(() => {
    jest.setSystemTime(realNow);
    jest.useRealTimers();
  });

  test('delays second call by at least 500ms', async () => {
    const timestamps = [];
    jest.unstable_mockModule('node-fetch', () => ({
      default: jest.fn(() => {
        timestamps.push(Date.now());
        return Promise.resolve({
          ok: true,
          json: async () => [[0, '1', '1', '1', '1', '1']]
        });
      })
    }));
    const { fetchKlines } = await import('../../src/core/binance.js');
    const fetchMock = (await import('node-fetch')).default;

    const p1 = fetchKlines({ symbol: 'BTCUSDT', interval: '1m', limit: 1 });
    const p2 = fetchKlines({ symbol: 'BTCUSDT', interval: '1m', limit: 1 });
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(499);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    await Promise.all([p1, p2]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(500);
  });
});
