import { query } from '../storage/db.js';
import { upsertSignals } from '../storage/repos/signals.js';
import { runStrategy } from '../core/signals/engine.js';
import SidewaysReversal from '../core/signals/strategies/SidewaysReversal.js';
import BBRevert from '../core/signals/strategies/BBRevert.js';

const STRATEGIES = {
  SidewaysReversal,
  BBRevert,
};

export async function signalsGenerate(opts) {
  const { symbol, interval, strategy: strategyName } = opts;
  const strategy = STRATEGIES[strategyName];
  if (!strategy) throw new Error(`Unknown strategy: ${strategyName}`);

  const indicators = await query(
    `select i.open_time, i.data, c.close
     from indicators_${interval} i
     join candles_${interval} c on i.symbol = c.symbol and i.open_time = c.open_time
     where i.symbol=$1 order by i.open_time`,
    [symbol]
  );
  const patterns = await query(
    `select open_time, bullish_engulfing, bearish_engulfing, hammer, shooting_star from patterns_${interval} where symbol=$1`,
    [symbol]
  );
  const patternMap = new Map(
    patterns.map((p) => [
      p.open_time,
      {
        ...(p.bullish_engulfing && { bullishEngulfing: true }),
        ...(p.bearish_engulfing && { bearishEngulfing: true }),
        ...(p.hammer && { hammer: true }),
        ...(p.shooting_star && { shootingStar: true }),
      },
    ])
  );

  const signals = [];
  for (const row of indicators) {
    const ind = {
      close: Number(row.close),
      ...row.data,
      ...(patternMap.get(row.open_time) || {}),
    };
    const sig = runStrategy(strategy, ind);
    if (sig) signals.push({ openTime: row.open_time, signal: sig });
  }

  await upsertSignals(symbol, signals);
  console.log(`generated ${signals.length} signals`);
}
