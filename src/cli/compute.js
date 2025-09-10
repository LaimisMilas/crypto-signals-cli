import { query } from '../storage/db.js';
import { upsertIndicators } from '../storage/repos/indicators.js';
import { rsi } from '../core/indicators/rsi.js';
import { atr } from '../core/indicators/atr.js';
import { aroon } from '../core/indicators/aroon.js';
import { bollinger } from '../core/indicators/bollinger.js';
import { trend } from '../core/indicators/trend.js';
import { hhll } from '../core/indicators/hhll.js';

export async function computeIndicators(opts) {
  const { symbol } = opts;
  const candles = await query(
    'select open_time, open, high, low, close, volume from candles_1m where symbol=$1 order by open_time',
    [symbol]
  );
  const highs = [];
  const lows = [];
  const closes = [];
  const rows = [];
  for (const c of candles) {
    highs.push(Number(c.high));
    lows.push(Number(c.low));
    closes.push(Number(c.close));
    const data = {
      rsi: closes.length >= 15 ? rsi(closes) : null,
      atr: highs.length >= 15 ? atr(highs, lows, closes) : null,
      aroon: highs.length >= 25 ? aroon(highs, lows) : null,
      bollinger: closes.length >= 20 ? bollinger(closes) : null,
      trend: trend(closes),
      hhll: hhll(highs, lows),
    };
    rows.push({ openTime: c.open_time, data });
  }
  await upsertIndicators(symbol, rows);
  console.log(`computed ${rows.length} indicator rows`);
}

