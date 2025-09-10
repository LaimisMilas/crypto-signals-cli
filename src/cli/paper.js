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
  await insertTradesPaper(symbol, trades);
  await insertEquityPaper(symbol, equity);
  logger.info(`paper trading completed for ${symbol} using ${strategy}`);
  return { trades, equity };
}

export default { paperRun };
