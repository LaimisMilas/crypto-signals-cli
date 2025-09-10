import { query } from '../db.js';

export async function insertTradesPaper(symbol, trades) {
  for (const t of trades) {
    await query(
      `insert into trades_paper (symbol, open_time, qty, price)
       values ($1,$2,$3,$4)`,
      [symbol, t.entryTime, 1, t.entryPrice]
    );
  }
}

export default { insertTradesPaper };
