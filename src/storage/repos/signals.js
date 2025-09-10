import { withTransaction } from '../db.js';

export async function upsertSignals(symbol, signals) {
  await withTransaction(async (client) => {
    await Promise.all(
      signals.map((s) =>
        client.query(
          `insert into signals (symbol, open_time, signal)
           values ($1,$2,$3)
           on conflict (symbol, open_time) do update set signal = excluded.signal`,
          [symbol, s.openTime, s.signal]
        )
      )
    );
  });
}

export default { upsertSignals };
