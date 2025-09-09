import { fetchKlinesResume } from '../core/binance.js';
import { insertCandles } from '../storage/candles.js';

export async function fetchKlines(opts) {
  const { symbol } = opts;
  const data = await fetchKlinesResume({ symbol });
  await insertCandles(symbol, data);
  console.log(`fetched ${data.length} candles`);
}
