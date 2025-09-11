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

test('passes resume flag when provided', async () => {
  await fetchKlines({ symbol: 'TEST', resume: true });
  expect(fetchKlinesRange).toHaveBeenCalledWith(
    expect.objectContaining({
      symbol: 'TEST',
      interval: '1m',
      startMs: undefined,
      endMs: undefined,
      limit: 1000,
      resume: true
    })
  );
});

test('defaults resume to false when omitted', async () => {
  await fetchKlines({ symbol: 'TEST' });
  expect(fetchKlinesRange).toHaveBeenCalledWith(
    expect.objectContaining({
      symbol: 'TEST',
      interval: '1m',
      startMs: undefined,
      endMs: undefined,
      limit: 1000,
      resume: false
    })
  );
});
