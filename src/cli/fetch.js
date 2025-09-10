import { fetchKlinesRange } from '../core/binance.js';

export async function fetchKlines(opts) {
  const { symbol, from, to, interval = '1m', limit = 1000, resume } = opts;
  const startMs = from ? Number(from) : undefined;
  const endMs = to ? Number(to) : undefined;
  const count = await fetchKlinesRange({
    symbol,
    interval,
    startMs,
    endMs,
    limit: Number(limit),
    resume
  });
  console.log(`fetched ${count} candles`);
}
