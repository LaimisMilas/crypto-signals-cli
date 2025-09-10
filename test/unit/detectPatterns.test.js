import { jest } from '@jest/globals';

const candles = [
  { open_time: 1, open: 10, high: 11, low: 9, close: 10 },
  { open_time: 2, open: 10, high: 11.2, low: 8.5, close: 11 },
  { open_time: 3, open: 10, high: 11.4, low: 8.8, close: 9 },
];

jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: jest.fn(async (sql) => {
    if (sql.includes('from candles_1m')) {
      return candles;
    }
    return [];
  }),
}));

const upsertPatternsMock = jest.fn();
jest.unstable_mockModule('../../src/storage/repos/patterns.js', () => ({
  upsertPatterns: upsertPatternsMock,
}));

const { detectPatterns } = await import('../../src/cli/patterns.js');

test('detectPatterns uses custom multipliers', async () => {
  await detectPatterns({
    symbol: 'BTCUSDT',
    interval: '1m',
    hammer: { lowerMultiplier: 1.5 },
    star: { upperMultiplier: 1.3 },
  });
  expect(upsertPatternsMock).toHaveBeenCalledTimes(1);
  const rows = upsertPatternsMock.mock.calls[0][1];
  const hammerRow = rows.find((r) => r.openTime === 2);
  expect(hammerRow).toMatchObject({ hammer: true });

  const starRow = rows.find((r) => r.openTime === 3);
  expect(starRow).toMatchObject({ shootingStar: true });
});
