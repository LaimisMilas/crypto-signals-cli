import { LiveSimulator } from '../core/paper/liveSimulator.js';
import { insertEquityPaper } from '../storage/repos/equityPaper.js';
import logger from '../utils/logger.js';

export async function paperRun(opts) {
  const { strategy, symbol, initial, candles, signals, limit, ...rest } = opts;
  const simulator = new LiveSimulator({
    symbol,
    initialBalance: Number(initial),
    ...rest
  });
  const max = limit !== undefined ? Math.min(candles.length, Number(limit)) : candles.length;
  for (let i = 0; i < max; i++) {
    await simulator.process(candles[i], signals[i] || null);
  }
  logger.info(`paper trading completed for ${symbol} using ${strategy}`);
  return { trades: simulator.trades, equity: simulator.equity };
}

export async function paperEquitySnapshot(opts) {
  const { equity, source, dryRun } = opts;
  const ts = Date.now();
  if (!dryRun) {
    await insertEquityPaper(source, null, [{ time: ts, balance: Number(equity) }]);
  }
  logger.info(`equity snapshot recorded for ${source}`);
}

export default { paperRun, paperEquitySnapshot };
