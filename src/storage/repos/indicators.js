import { withTransaction } from '../db.js';

export async function upsertIndicators(symbol, rows, interval = '1m') {
  const table = `indicators_${interval}`;
  await withTransaction(async (client) => {
    await Promise.all(
      rows.map((r) =>
        client.query(
          `insert into ${table} (symbol, open_time, data)
           values ($1,$2,$3)
           on conflict (symbol, open_time) do update set data=$3`,
          [symbol, r.openTime, r.data]
        )
      )
    );
  });
}

