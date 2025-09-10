import { runBacktest } from '../core/backtest/runner.js';
import { insertTradesPaper } from '../storage/repos/tradesPaper.js';
import { insertEquityPaper } from '../storage/repos/equityPaper.js';
import logger from '../utils/logger.js';

export async function paperRun(opts) {
  const { strategy, symbol, initial, candles, signals, ...rest } = opts;
  const { trades, equity } = await runBacktest({
    candles,
    signals,
    initialBalance: Number(initial),
    ...rest
  });
  const tradesWithStatus = trades.map(t => ({ ...t, status: t.status || 'closed' }));
  await insertTradesPaper(symbol, tradesWithStatus);
  await insertEquityPaper('paper', symbol, equity);
  logger.info(`paper trading completed for ${symbol} using ${strategy}`);
  return { trades, equity };
}

export async function paperEquitySnapshot(opts) {
  const { equity, source } = opts;
  const ts = Date.now();
  await insertEquityPaper(source, null, [{ time: ts, balance: Number(equity) }]);
  logger.info(`equity snapshot recorded for ${source}`);
}

export default { paperRun, paperEquitySnapshot };
