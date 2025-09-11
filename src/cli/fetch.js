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

  const parseTime = (value) => {
    if (value === undefined) return undefined;
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return numeric;
    const ms = Date.parse(value);
    return Number.isNaN(ms) ? undefined : ms;
  };

  let startMs = parseTime(from);
  let endMs = parseTime(to);
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
