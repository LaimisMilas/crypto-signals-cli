import { jest } from '@jest/globals';
import { rsi } from '../../src/core/indicators/rsi.js';
import { atr } from '../../src/core/indicators/atr.js';
import { aroon } from '../../src/core/indicators/aroon.js';
import { bollinger } from '../../src/core/indicators/bollinger.js';
import { trend } from '../../src/core/indicators/trend.js';
import { hhll } from '../../src/core/indicators/hhll.js';

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

const upserts = [];

jest.unstable_mockModule('../../src/storage/db.js', () => ({
  query: jest.fn(async (sql, params) => {
    if (/select/i.test(sql)) return candles;
    upserts.push({ sql, params });
    return [];
  })
}));

const { computeIndicators } = await import('../../src/cli/compute.js');

test('computeIndicators persists computed values', async () => {
  await computeIndicators({ symbol: 'TEST' });
  expect(upserts.length).toBe(candles.length);
  const data = upserts[upserts.length - 1].params[2];
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const closes = candles.map(c => c.close);
  expect(data.rsi).toBeCloseTo(rsi(closes));
  expect(data.atr).toBeCloseTo(atr(highs, lows, closes));
  expect(data.aroon).toEqual(aroon(highs, lows));
  const bb = bollinger(closes);
  expect(data.bollinger.middle).toBeCloseTo(bb.middle);
  expect(data.bollinger.upper).toBeCloseTo(bb.upper);
  expect(data.bollinger.lower).toBeCloseTo(bb.lower);
  expect(data.trend).toBe(trend(closes));
  const expectedHhll = hhll(highs, lows);
  expect(expectedHhll).toBe('HH');
  expect(data.hhll).toBe(expectedHhll);
});

