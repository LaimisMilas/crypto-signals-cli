import { runBacktest } from '../core/backtest/runner.js';
import { insertTrades } from '../storage/repos/trades.js';
import { insertEquity } from '../storage/repos/equity.js';

export async function backtestRun(opts) {
  const { strategy, symbol, from, to, initial, candles, signals, ...rest } = opts;
  const { trades, equity } = await runBacktest({
    candles,
    signals,
    initialBalance: Number(initial),
    ...rest
  });
  await insertTrades(symbol, trades);
  await insertEquity(symbol, equity);
  console.log(`backtest completed for ${symbol} using ${strategy}`);
  return { trades, equity };
}
