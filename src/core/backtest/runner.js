import { atr } from '../indicators/atr.js';

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
  let position = null; // {side, entryPrice, sl, tp, entryTime}

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
        side: 'long',
        entryPrice,
        sl: entryPrice - atrVal * atrMultiplier,
        tp: entryPrice + atrVal * atrMultiplier,
        entryTime: c.openTime
      };
    } else if (!position && atrVal && signal === 'sell') {
      const entryPrice = c.close;
      position = {
        side: 'short',
        entryPrice,
        sl: entryPrice + atrVal * atrMultiplier,
        tp: entryPrice - atrVal * atrMultiplier,
        entryTime: c.openTime
      };
    }

    if (position) {
      let exitPrice = null;
      let exitTime = c.openTime;
      if (position.side === 'long') {
        if (c.low <= position.sl) exitPrice = position.sl;
        else if (c.high >= position.tp) exitPrice = position.tp;
        else if (signal === 'sell') exitPrice = c.close;
      } else if (position.side === 'short') {
        if (c.high >= position.sl) exitPrice = position.sl;
        else if (c.low <= position.tp) exitPrice = position.tp;
        else if (signal === 'buy') exitPrice = c.close;
      }
      if (exitPrice !== null) {
        const pnl =
          position.side === 'long'
            ? exitPrice - position.entryPrice
            : position.entryPrice - exitPrice;
        balance += pnl;
        trades.push({
          entryTime: position.entryTime,
          exitTime,
          entryPrice: position.entryPrice,
          exitPrice,
          side: position.side,
          pnl
        });
        position = null;
      }
    }

    equity.push({ time: c.openTime, balance });
  }

  return { trades, equity };
}

export default { runBacktest };
