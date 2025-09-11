import { query } from '../db.js';

export async function insertEquityPaper(source, symbol, equity) {
  for (const e of equity) {
    await query(
      `insert into equity_paper (ts, equity, source, symbol)
       values ($1,$2,$3,$4)
       on conflict (ts) do update
       set equity = excluded.equity,
           source = excluded.source,
           symbol = excluded.symbol`,
      [e.time, e.balance, source, symbol]
    );
  }
}

export default { insertEquityPaper };
