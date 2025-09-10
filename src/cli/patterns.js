import { query } from '../storage/db.js';
import { bullishEngulfing, bearishEngulfing } from '../core/patterns/engulfing.js';
import { hammer } from '../core/patterns/hammer.js';
import { shootingStar } from '../core/patterns/star.js';
import { upsertPatterns } from '../storage/repos/patterns.js';

export async function detectPatterns({
  symbol,
  hammer: hammerOptions = {},
  star: starOptions = {},
} = {}) {
  const candles = await query(
    'select open_time, open, high, low, close from candles_1m where symbol=$1 order by open_time',
    [symbol]
  );

  if (candles.length > 0) {
    await upsertPatterns(symbol, candles[0].open_time, {
      bullishEngulfing: false,
      bearishEngulfing: false,
      hammer: false,
      shootingStar: false,
    });
  }

  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    await upsertPatterns(symbol, curr.open_time, {
      bullishEngulfing: bullishEngulfing(prev, curr),
      bearishEngulfing: bearishEngulfing(prev, curr),
      hammer: hammer(curr, hammerOptions),
      shootingStar: shootingStar(curr, starOptions),
    });
  }

  console.log('detect patterns');
}
