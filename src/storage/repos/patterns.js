import { query } from '../db.js';

export async function upsertPattern(symbol, openTime, data) {
  await query(
    `insert into patterns_1m (symbol, open_time, data)
     values ($1,$2,$3)
     on conflict (symbol, open_time)
     do update set data=$3`,
    [symbol, openTime, data]
  );
}
