import { withTransaction } from '../db.js';

// Upsert signals keeping strategy and interval distinction.
// This ensures that different strategies or intervals do not overwrite each other.
export async function upsertSignals(symbol, interval, strategy, signals) {
  await withTransaction(async (client) => {
    await Promise.all(
      signals.map((s) =>
        client.query(
          `insert into signals (symbol, interval, open_time, strategy, signal)
           values ($1,$2,$3,$4,$5)
           on conflict (symbol, interval, open_time, strategy) do update set signal = excluded.signal`,
          [
            symbol,
            interval,
            s.openTime instanceof Date ? s.openTime : new Date(Number(s.openTime)),
            strategy,
            s.signal,
          ]
        )
      )
    );
  });
}

export default { upsertSignals };

