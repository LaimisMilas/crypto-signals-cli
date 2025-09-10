import { runBacktest } from '../core/backtest/runner.js';
import { query } from '../storage/db.js';
import { insertTradesPaper } from '../storage/repos/tradesPaper.js';
import { insertEquityPaper } from '../storage/repos/equityPaper.js';
import logger from '../utils/logger.js';
import fs from 'fs/promises';
import path from 'path';

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

  const { trades, equity, metrics } = await runBacktest({
    candles,
    signals,
    initialBalance: Number(initial),
    ...rest
  });
  const tradesWithStatus = trades.map(t => ({ ...t, status: t.status || 'closed' }));

  await insertTradesPaper(symbol, tradesWithStatus);
  await insertEquityPaper('backtest', symbol, equity);

  const dirName = `${strategy}_${symbol}_${interval}_${from}_${to}`;
  const outDir = path.join('out', 'backtest', dirName);
  await fs.mkdir(outDir, { recursive: true });

  const tradesHeader = 'entryTime,exitTime,entryPrice,exitPrice,side,pnl\n';
  const tradesCsv =
    tradesHeader +
    trades
      .map(
        t =>
          `${t.entryTime},${t.exitTime},${t.entryPrice},${t.exitPrice},${t.side},${t.pnl}`
      )
      .join('\n');
  await fs.writeFile(path.join(outDir, 'trades.csv'), tradesCsv);

  const equityHeader = 'time,balance\n';
  const equityCsv =
    equityHeader + equity.map(e => `${e.time},${e.balance}`).join('\n');
  await fs.writeFile(path.join(outDir, 'equity.csv'), equityCsv);

  await fs.writeFile(
    path.join(outDir, 'metrics.json'),
    JSON.stringify(metrics, null, 2)
  );

  const config = {
    strategy,
    symbol,
    from,
    to,
    interval,
    initial,
    ...rest
  };
  await fs.writeFile(
    path.join(outDir, 'config.json'),
    JSON.stringify(config, null, 2)
  );

  logger.info(`backtest completed for ${symbol} using ${strategy}`);
  return { trades, equity, metrics };
}
