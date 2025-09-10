import { query } from '../db.js';

export async function upsertPatterns(
  symbol,
  openTime,
  {
    bullishEngulfing = false,
    bearishEngulfing = false,
    hammer = false,
    shootingStar = false
  } = {}
) {
  await query(
    `insert into patterns_1m (symbol, open_time, bullish_engulfing, bearish_engulfing, hammer, shooting_star)
     values ($1,$2,$3,$4,$5,$6)
     on conflict (symbol, open_time)
     do update set bullish_engulfing=$3, bearish_engulfing=$4, hammer=$5, shooting_star=$6`,
    [symbol, openTime, bullishEngulfing, bearishEngulfing, hammer, shootingStar]
  );
}
