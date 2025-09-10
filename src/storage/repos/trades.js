import { query } from '../db.js';

export async function insertTrades(symbol, trades) {
  for (const t of trades) {
    await query(
      `insert into trades (symbol, entry_time, exit_time, entry_price, exit_price, side, pnl)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [
        symbol,
        t.entryTime,
        t.exitTime,
        t.entryPrice,
        t.exitPrice,
        t.side,
        t.pnl
      ]
    );
  }
}

export default { insertTrades };
