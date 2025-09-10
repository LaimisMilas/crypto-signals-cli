import { jest } from '@jest/globals';

const realNow = Date.now();

describe('fetchKlines retry', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
    jest.setSystemTime(1_000_000);
  });

  afterEach(() => {
    jest.setSystemTime(realNow);
    jest.useRealTimers();
  });

  test('retries on transient error', async () => {
    jest.unstable_mockModule('node-fetch', () => ({ default: jest.fn() }));
    const { fetchKlines } = await import('../../src/core/binance.js');
    const fetchMock = (await import('node-fetch')).default;
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[0, '1', '1', '1', '1', '1']]
      });

    const promise = fetchKlines({ symbol: 'BTCUSDT', interval: '1m', limit: 1 });
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(500);
    const data = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(data).toHaveLength(1);
  });

  test('uses retry-after header when rate limited', async () => {
    jest.unstable_mockModule('node-fetch', () => ({ default: jest.fn() }));
    const { fetchKlines } = await import('../../src/core/binance.js');
    const fetchMock = (await import('node-fetch')).default;
    const headers = new Map([['retry-after', '1']]);
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 429, headers })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [[0, '1', '1', '1', '1', '1']]
      });

    const promise = fetchKlines({ symbol: 'BTCUSDT', interval: '1m', limit: 1 });
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(999);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await jest.advanceTimersByTimeAsync(1);
    const data = await promise;

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(data).toHaveLength(1);
  });
});
