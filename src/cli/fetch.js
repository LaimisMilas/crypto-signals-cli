import { fetchKlinesRange, fetchServerTime, getServerTime } from '../core/binance.js';
import logger from '../utils/logger.js';

export async function fetchKlines(opts) {
  const { symbol, from, to, interval = '1m', limit = 1000, resume = false, serverTime } = opts;
  let startMs = from ? Number(from) : undefined;
  let endMs = to ? Number(to) : undefined;
  if (serverTime) {
    const serverMs = await fetchServerTime();
    const offset = serverMs - Date.now();
    if (startMs !== undefined) startMs += offset;
    if (endMs !== undefined) endMs += offset;
  }
  const count = await fetchKlinesRange({
    symbol,
    interval,
    startMs,
    endMs,
    limit: Number(limit),
    resume
  });
  logger.info(`fetched ${count} candles`);
}
