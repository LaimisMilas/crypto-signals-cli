import { jest } from '@jest/globals';

const fetchKlinesRange = jest.fn(async () => 0);

jest.unstable_mockModule('../../src/core/binance.js', () => ({
  fetchKlinesRange,
  fetchServerTime: jest.fn(),
  getServerTime: jest.fn()
}));

const { fetchKlines } = await import('../../src/cli/fetch.js');

beforeEach(() => {
  fetchKlinesRange.mockClear();
});

test('parses ISO date strings for from and to', async () => {
  const from = '2024-01-01T00:00:00Z';
  const to = '2024-01-02T00:00:00Z';
  await fetchKlines({ symbol: 'TEST', from, to });
  expect(fetchKlinesRange).toHaveBeenCalledWith(
    expect.objectContaining({
      symbol: 'TEST',
      interval: '1m',
      startMs: Date.parse(from),
      endMs: Date.parse(to)
    })
  );
});

