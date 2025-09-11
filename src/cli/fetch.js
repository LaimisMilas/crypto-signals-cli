import { fetchKlinesRange, fetchServerTime } from '../core/binance.js';
import logger from '../utils/logger.js';

export async function fetchKlines(opts) {
  const {
    symbol,
    from,
    to,
    interval = '1m',
    fetchLimit = 1000,
    resume = false,
    serverTime,
    limit,
    dryRun
  } = opts;
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
    limit: Number(fetchLimit),
    resume,
    dryRun,
    max: limit !== undefined ? Number(limit) : undefined
  });
  logger.info(`fetched ${count} candles`);
}
