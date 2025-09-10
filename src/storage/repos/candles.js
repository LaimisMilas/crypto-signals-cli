import { query } from '../db.js';

export async function insertCandles(symbol, interval, candles) {
  const table = `candles_${interval}`;
  for (const c of candles) {
    await query(
      `insert into ${table} (symbol, open_time, open, high, low, close, volume)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (symbol, open_time) do update set open=$3, high=$4, low=$5, close=$6, volume=$7`,
      [symbol, c.openTime, c.open, c.high, c.low, c.close, c.volume]
    );
  }
}
