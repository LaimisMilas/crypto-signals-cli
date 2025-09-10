import { query } from '../db.js';

export async function upsertSignals(symbol, signals) {
  for (const s of signals) {
    await query(
      `insert into signals (symbol, open_time, signal)
       values ($1,$2,$3)
       on conflict (symbol, open_time) do update set signal = excluded.signal`,
      [symbol, s.openTime, s.signal]
    );
  }
}

export default { upsertSignals };
