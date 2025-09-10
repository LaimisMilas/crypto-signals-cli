import { jest } from '@jest/globals';

jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: jest.fn(async () => [])
}));

jest.unstable_mockModule('../../src/core/binance.js', () => ({
  fetchKlines: async () => [{ openTime: 0, open: 1, high: 1, low: 1, close: 1, volume: 1 }]
}));

const { fetchKlines } = await import('../../src/core/binance.js');
const { insertCandles } = await import('../../src/storage/repos/candles.js');
const db = await import('../../src/storage/db.js');

test('fetch and insert', async () => {
  const data = await fetchKlines({ symbol: 'BTCUSDT', interval: '1m', limit: 1 });
  await insertCandles('BTCUSDT', data);
  expect(db.query).toHaveBeenCalled();
});
