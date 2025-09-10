import { query } from '../db.js';

export async function upsertIndicators(symbol, rows) {
  for (const r of rows) {
    await query(
      `insert into indicators_1m (symbol, open_time, data)
       values ($1,$2,$3)
       on conflict (symbol, open_time) do update set data=$3`,
      [symbol, r.openTime, r.data]
    );
  }
}

