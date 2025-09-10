import { query } from '../storage/db.js';
import { bullishEngulfing, bearishEngulfing } from '../core/patterns/engulfing.js';
import { hammer } from '../core/patterns/hammer.js';
import { shootingStar } from '../core/patterns/star.js';
import { upsertPattern } from '../storage/repos/patterns.js';

export async function detectPatterns({ symbol }) {
  const candles = await query(
    'select open_time, open, high, low, close from candles_1m where symbol=$1 order by open_time',
    [symbol]
  );

  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const data = {};
    if (bullishEngulfing(prev, curr)) data.bullishEngulfing = true;
    if (bearishEngulfing(prev, curr)) data.bearishEngulfing = true;
    if (hammer(curr)) data.hammer = true;
    if (shootingStar(curr)) data.shootingStar = true;
    if (Object.keys(data).length > 0) {
      await upsertPattern(symbol, curr.open_time, data);
    }
  }

  console.log('detect patterns');
}
