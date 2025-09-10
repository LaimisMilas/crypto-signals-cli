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
    `select open_time, data from indicators_${interval} where symbol=$1 order by open_time`,
    [symbol]
  );
  const patterns = await query(
    `select open_time, data from patterns_${interval} where symbol=$1`,
    [symbol]
  );
  const patternMap = new Map(patterns.map(p => [p.open_time, p.data]));

  const signals = [];
  for (const row of indicators) {
    const ind = { ...row.data, ...(patternMap.get(row.open_time) || {}) };
    const sig = runStrategy(strategy, ind);
    if (sig) signals.push({ openTime: row.open_time, signal: sig });
  }

  await upsertSignals(symbol, signals);
  console.log(`generated ${signals.length} signals`);
}
