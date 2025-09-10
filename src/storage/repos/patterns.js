import { withTransaction } from '../db.js';

export async function upsertPatterns(symbol, rows, interval = '1m') {
  const table = `patterns_${interval}`;
  await withTransaction(async (client) => {
    await Promise.all(
      rows.map((r) =>
        client.query(
          `insert into ${table} (symbol, open_time, bullish_engulfing, bearish_engulfing, hammer, shooting_star)
           values ($1,$2,$3,$4,$5,$6)
           on conflict (symbol, open_time)
           do update set bullish_engulfing=$3, bearish_engulfing=$4, hammer=$5, shooting_star=$6`,
          [
            symbol,
            r.openTime,
            r.bullishEngulfing ?? false,
            r.bearishEngulfing ?? false,
            r.hammer ?? false,
            r.shootingStar ?? false,
          ]
        )
      )
    );
  });
}

