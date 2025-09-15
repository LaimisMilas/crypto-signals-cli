import { atr } from '../indicators/atr.js';

export function calcWinrate(trades = []) {
  if (!trades.length) return 0;
  const wins = trades.filter(t => t.pnl > 0).length;
  return wins / trades.length;
}

export function calcProfitFactor(trades = []) {
  let grossProfit = 0;
  let grossLoss = 0;
  for (const t of trades) {
    if (t.pnl > 0) grossProfit += t.pnl;
    else if (t.pnl < 0) grossLoss += Math.abs(t.pnl);
  }
  return grossLoss ? grossProfit / grossLoss : 0;
}

export function calcMaxDrawdown(equity = []) {
  let peak = equity.length ? equity[0].balance : 0;
  let maxDD = 0;
  for (const e of equity) {
    if (e.balance > peak) peak = e.balance;
    const dd = peak - e.balance;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

export function calcAveragePnL(trades = []) {
  if (!trades.length) return 0;
  const total = trades.reduce((sum, t) => sum + t.pnl, 0);
  return total / trades.length;
}

export function calculateMetrics(trades, equity) {
  return {
    winrate: calcWinrate(trades),
    profitFactor: calcProfitFactor(trades),
    maxDrawdown: calcMaxDrawdown(equity),
    avgPnL: calcAveragePnL(trades),
  };
}

/**
 * Run a simple backtest over provided candles and signals.
 * @param {Object} opts
 * @param {Array} opts.candles Array of candle objects {openTime, high, low, close}
 * @param {Array} opts.signals Array of signals corresponding to candles ('buy'/'sell'/null)
 * @param {number} opts.initialBalance Starting equity
 * @param {number} [opts.atrPeriod=14] ATR period
 * @param {number} [opts.atrMultiplier=2] Multiplier for TP/SL calculation
 * @returns {{trades: Array, equity: Array}}
 */
export async function runBacktest({
  candles = [],
  signals = [],
  initialBalance = 0,
  atrPeriod = 14,
  atrMultiplier = 2
}) {
  let balance = initialBalance;
  const trades = [];
  const equity = [];

  const highs = [];
  const lows = [];
  const closes = [];
  let position = null; // {entryPrice, sl, tp, entryTime}

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const signal = signals[i] || null;

    highs.push(c.high);
    lows.push(c.low);
    closes.push(c.close);
    const atrVal = atr(highs, lows, closes, atrPeriod);

    if (!position && atrVal && signal === 'buy') {
      const entryPrice = c.close;
      position = {
        entryPrice,
        sl: entryPrice - atrVal * atrMultiplier,
        tp: entryPrice + atrVal * atrMultiplier,
        entryTime: c.openTime
      };
    }

    if (position) {
      let exitPrice = null;
      let exitTime = c.openTime;
      if (c.low <= position.sl) exitPrice = position.sl;
      else if (c.high >= position.tp) exitPrice = position.tp;
      else if (signal === 'sell') exitPrice = c.close;
      if (exitPrice !== null) {
        const pnl = exitPrice - position.entryPrice;
        balance += pnl;
        trades.push({
          entryTime: position.entryTime,
          exitTime,
          entryPrice: position.entryPrice,
          exitPrice,
          side: 'long',
          pnl
        });
        position = null;
      }
    }

    equity.push({ time: c.openTime, balance });
  }

  const metrics = calculateMetrics(trades, equity);
  return { trades, equity, metrics };
}

export default { runBacktest };
