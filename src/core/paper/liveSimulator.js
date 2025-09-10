import { atr } from '../indicators/atr.js';
import { insertTradesPaper } from '../../storage/repos/tradesPaper.js';
import { insertEquityPaper } from '../../storage/repos/equityPaper.js';

export class LiveSimulator {
  constructor({ symbol, initialBalance = 0, atrPeriod = 14, atrMultiplier = 2 }) {
    this.symbol = symbol;
    this.balance = initialBalance;
    this.atrPeriod = atrPeriod;
    this.atrMultiplier = atrMultiplier;
    this.position = null; // {side, entryPrice, sl, tp, entryTime}
    this.trades = [];
    this.equity = [];
    this.highs = [];
    this.lows = [];
    this.closes = [];
  }

  async process(candle, signal) {
    const { openTime, high, low, close } = candle;
    this.highs.push(high);
    this.lows.push(low);
    this.closes.push(close);
    const atrVal = atr(this.highs, this.lows, this.closes, this.atrPeriod);

    if (!this.position && atrVal && signal === 'buy') {
      const entryPrice = close;
      this.position = {
        side: 'long',
        entryPrice,
        sl: entryPrice - atrVal * this.atrMultiplier,
        tp: entryPrice + atrVal * this.atrMultiplier,
        entryTime: openTime
      };
    } else if (!this.position && atrVal && signal === 'sell') {
      const entryPrice = close;
      this.position = {
        side: 'short',
        entryPrice,
        sl: entryPrice + atrVal * this.atrMultiplier,
        tp: entryPrice - atrVal * this.atrMultiplier,
        entryTime: openTime
      };
    }

    if (this.position) {
      let exitPrice = null;
      let exitTime = openTime;
      if (this.position.side === 'long') {
        if (low <= this.position.sl) exitPrice = this.position.sl;
        else if (high >= this.position.tp) exitPrice = this.position.tp;
        else if (signal === 'sell') exitPrice = close;
      } else if (this.position.side === 'short') {
        if (high >= this.position.sl) exitPrice = this.position.sl;
        else if (low <= this.position.tp) exitPrice = this.position.tp;
        else if (signal === 'buy') exitPrice = close;
      }
      if (exitPrice !== null) {
        const pnl =
          this.position.side === 'long'
            ? exitPrice - this.position.entryPrice
            : this.position.entryPrice - exitPrice;
        this.balance += pnl;
        const trade = {
          entryTime: this.position.entryTime,
          exitTime,
          entryPrice: this.position.entryPrice,
          exitPrice,
          side: this.position.side,
          pnl,
          status: 'closed'
        };
        this.trades.push(trade);
        await insertTradesPaper(this.symbol, [trade]);
        this.position = null;
      }
    }

    const equityPoint = { time: openTime, balance: this.balance };
    this.equity.push(equityPoint);
    await insertEquityPaper('paper', this.symbol, [equityPoint]);
  }
}

export default { LiveSimulator };
