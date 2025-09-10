import { query } from '../db.js';

export async function insertEquityPaper(symbol, equity) {
  for (const e of equity) {
    await query(
      `insert into equity_paper (ts, equity)
       values ($1,$2)`,
      [e.time, e.balance]
    );
  }
}

export default { insertEquityPaper };
