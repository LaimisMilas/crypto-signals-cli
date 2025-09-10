import { runBacktest } from '../core/backtest/runner.js';
import { query } from '../storage/db.js';
import { insertTradesPaper } from '../storage/repos/tradesPaper.js';
import { insertEquityPaper } from '../storage/repos/equityPaper.js';
import logger from '../utils/logger.js';

export async function backtestRun(opts) {
  const {
    strategy,
    symbol,
    from,
    to,
    interval = '1m',
    initial,
    candles: candlesInput,
    signals: signalsInput,
    ...rest
  } = opts;

  let candles = candlesInput;
  if (!candles) {
    const rows = await query(
      `select open_time, open, high, low, close from candles_${interval} where symbol=$1 and open_time >= $2 and open_time <= $3 order by open_time`,
      [symbol, from, to]
    );
    candles = rows.map((c) => ({
      openTime: Number(c.open_time),
      high: Number(c.high),
      low: Number(c.low),
      close: Number(c.close)
    }));
  }

  let signals = signalsInput;
  if (!signals) {
    const rows = await query(
      `select open_time, signal from signals where symbol=$1 and strategy=$2 and open_time >= $3 and open_time <= $4 order by open_time`,
      [symbol, strategy, from, to]
    );
    const map = new Map(rows.map((r) => [Number(r.open_time), r.signal]));
    signals = candles.map((c) => map.get(c.openTime) || null);
  }

  const { trades, equity } = await runBacktest({
    candles,
    signals,
    initialBalance: Number(initial),
    ...rest
  });

  await insertTradesPaper(symbol, trades);
  await insertEquityPaper(symbol, equity);
  logger.info(`backtest completed for ${symbol} using ${strategy}`);
  return { trades, equity };
}
