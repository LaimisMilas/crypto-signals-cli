import { jest } from '@jest/globals';
import { rsi } from '../../src/core/indicators/rsi.js';
import { atr } from '../../src/core/indicators/atr.js';
import { aroon } from '../../src/core/indicators/aroon.js';
import { bollinger } from '../../src/core/indicators/bollinger.js';
import { trend } from '../../src/core/indicators/trend.js';
import { hhll } from '../../src/core/indicators/hhll.js';

// create a sequence of candles long enough to compute all indicators
const highsArr = [5,6,7,9,7,6,5,7,8,10,8,7,6,8,11,9,8,10,12,11,13,14,15,16,17,18,19,20,21,22];
const lowsArr =  [1,2,3,4,3,2,1,3,4,5,4,3,2,4,5,6,5,6,7,6,8,9,10,11,12,13,14,15,16,17];
const closesArr = highsArr.map((h, i) => (h + lowsArr[i]) / 2);
const candles = highsArr.map((h, i) => ({
  open_time: i + 1,
  open: closesArr[i],
  high: h,
  low: lowsArr[i],
  close: closesArr[i],
  volume: 1,
}));

const upsertMock = jest.fn(async () => {});
jest.unstable_mockModule('../../src/storage/repos/indicators.js', () => ({
  upsertIndicators: upsertMock,
}));

const queryMock = jest.fn(async () => candles);
jest.unstable_mockModule('../../src/storage/db.js', () => ({ query: queryMock }));

const { computeIndicators } = await import('../../src/cli/compute.js');

test('computeIndicators upserts computed indicator values', async () => {
  await computeIndicators({ symbol: 'SOLUSDT' });

  expect(queryMock).toHaveBeenCalled();
  expect(upsertMock).toHaveBeenCalledTimes(1);

  const rows = upsertMock.mock.calls[0][1];
  expect(rows).toHaveLength(candles.length);

  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const closes = candles.map(c => c.close);
  const a = aroon(highs, lows);
  const bb = bollinger(closes);
  const data = rows[rows.length - 1].data;

  expect(data.rsi).toBeCloseTo(rsi(closes));
  expect(data.atr).toBeCloseTo(atr(highs, lows, closes));
  expect(data.aroon).toEqual(a);
  expect(data.bollinger.middle).toBeCloseTo(bb.middle);
  expect(data.bollinger.upper).toBeCloseTo(bb.upper);
  expect(data.bollinger.lower).toBeCloseTo(bb.lower);
  expect(data.trend).toBe(
    trend(closes[closes.length - 1], bb.middle, a.up, a.down)
  );
  expect(data.hhll).toBe(hhll(highs, lows));
});

