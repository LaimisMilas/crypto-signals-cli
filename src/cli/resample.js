import { query } from '../storage/db.js';
import { insertCandles } from '../storage/repos/candles.js';
import logger from '../utils/logger.js';

function intervalToMs(interval) {
  const n = parseInt(interval.slice(0, -1));
  const unit = interval.slice(-1);
  const mult = { m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return n * mult;
}

export async function resampleCandles(opts) {
  const { from, to, symbol, dryRun, limit } = opts;
  const fromMs = intervalToMs(from);
  const toMs = intervalToMs(to);
  if (toMs % fromMs !== 0) {
    throw new Error('target interval must be multiple of source interval');
  }
  const rows = await query(
    `select open_time, open, high, low, close, volume from candles_${from} where symbol=$1 order by open_time`,
    [symbol]
  );
  const rowLimit = limit !== undefined ? Math.min(rows.length, Number(limit)) : rows.length;
  const out = [];
  let curr = null;
  for (const r of rows.slice(0, rowLimit)) {
    const t = Number(r.open_time);
    const bucket = Math.floor(t / toMs) * toMs;
    if (!curr || bucket !== curr.openTime) {
      if (curr) out.push(curr);
      curr = {
        openTime: bucket,
        open: Number(r.open),
        high: Number(r.high),
        low: Number(r.low),
        close: Number(r.close),
        volume: Number(r.volume),
      };
    } else {
      curr.high = Math.max(curr.high, Number(r.high));
      curr.low = Math.min(curr.low, Number(r.low));
      curr.close = Number(r.close);
      curr.volume += Number(r.volume);
    }
  }
  if (curr) out.push(curr);
  if (out.length > 0 && !dryRun) await insertCandles(symbol, out, to);
  logger.info(`resampled ${out.length} candles from ${from} to ${to}`);
}

