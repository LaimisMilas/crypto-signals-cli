import { withTransaction } from '../db.js';

export async function insertCandles(symbol, candles, interval = '1m') {
  const table = `candles_${interval}`;
  await withTransaction(async (client) => {
    await Promise.all(
      candles.map((c) =>
        client.query(
          `insert into ${table} (symbol, open_time, open, high, low, close, volume)
           values ($1,$2,$3,$4,$5,$6,$7)
           on conflict (symbol, open_time) do update set open=$3, high=$4, low=$5, close=$6, volume=$7`,
          [symbol, c.openTime, c.open, c.high, c.low, c.close, c.volume]
        )
      )
    );
  });
}
