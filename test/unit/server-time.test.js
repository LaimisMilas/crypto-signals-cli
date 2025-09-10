import { jest } from '@jest/globals';

const fetchMock = jest.fn(async url => {
  if (url.toString().endsWith('/api/v3/time')) {
    return { ok: true, json: async () => ({ serverTime: 2000 }) };
  }
  throw new Error(`Unexpected URL: ${url}`);
});

jest.unstable_mockModule('node-fetch', () => ({ default: fetchMock }));

jest.unstable_mockModule('../../src/core/binance.js', async () => {
  const { default: fetch } = await import('node-fetch');
  return {
    fetchKlinesRange: jest.fn(),
    fetchServerTime: async () => {
      const url = new URL('/api/v3/time', 'https://api.binance.com');
      const res = await fetch(url);
      if (!res.ok) throw new Error('binance error');
      const data = await res.json();
      return data.serverTime;
    },
    getServerTime: jest.fn(() => Date.now())
  };
});

const { fetchKlines } = await import('../../src/cli/fetch.js');
const { fetchKlinesRange } = await import('../../src/core/binance.js');

test('fetchKlines adjusts times using server time', async () => {
  const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1000);
  await fetchKlines({ symbol: 'TEST', from: '0', to: '100', serverTime: true });
  expect(fetchKlinesRange).toHaveBeenCalledWith({
    symbol: 'TEST',
    interval: '1m',
    startMs: 1000,
    endMs: 1100,
    limit: 1000,
    resume: undefined
  });
  nowSpy.mockRestore();
});
