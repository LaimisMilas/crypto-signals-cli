import { query } from '../db.js';

export async function insertTradesPaper(symbol, trades) {
  for (const t of trades) {
    await query(
      `insert into trades_paper (symbol, open_time, ts_close, side, qty, price, exit, pnl, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        symbol,
        t.entryTime,
        t.exitTime,
        t.side,
        1,
        t.entryPrice,
        t.exitPrice,
        t.pnl,
        t.status
      ]
    );
  }
}

export default { insertTradesPaper };
