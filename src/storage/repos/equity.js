import { query } from '../db.js';

export async function insertEquity(symbol, equity) {
  for (const e of equity) {
    await query(
      `insert into equity (symbol, time, balance)
       values ($1,$2,$3)`,
      [symbol, e.time, e.balance]
    );
  }
}

export default { insertEquity };
