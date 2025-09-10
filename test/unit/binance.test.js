import { jest } from '@jest/globals';

const originalBaseUrl = process.env.BINANCE_BASE_URL;

afterEach(() => {
  process.env.BINANCE_BASE_URL = originalBaseUrl;
  jest.resetModules();
});

test('fetchKlines uses config.binance.baseUrl', async () => {
  const base = 'https://example.com';
  process.env.BINANCE_BASE_URL = base;

  const fetchMock = jest.fn(async () => ({ ok: true, json: async () => [] }));
  jest.unstable_mockModule('node-fetch', () => ({ default: fetchMock }));
  jest.unstable_mockModule('../../src/storage/db.js', () => ({ query: jest.fn() }));
  jest.unstable_mockModule('../../src/storage/repos/candles.js', () => ({ insertCandles: jest.fn() }));

  const { fetchKlines } = await import('../../src/core/binance.js');
  await fetchKlines({ symbol: 'BTCUSDT', interval: '1m' });

  const url = fetchMock.mock.calls[0][0];
  expect(url.origin).toBe(base);
});
