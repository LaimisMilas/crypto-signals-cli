import { runStrategy } from '../../../src/core/signals/engine.js';
import BBRevert from '../../../src/core/signals/strategies/BBRevert.js';

test('entry returns buy when conditions met', () => {
  const ind = {
    close: 90,
    bollinger: { lower: 100, upper: 110 },
    aroon: { up: 60 },
    rsi: 50,
  };
  const sig = runStrategy(BBRevert, ind);
  expect(sig).toBe('buy');
});

test('exit returns sell when close above upper band', () => {
  const ind = {
    close: 120,
    bollinger: { lower: 100, upper: 110 },
    aroon: { up: 40 },
    rsi: 50,
  };
  const sig = runStrategy(BBRevert, ind);
  expect(sig).toBe('sell');
});

test('exit returns sell when rsi above 70', () => {
  const ind = {
    close: 105,
    bollinger: { lower: 100, upper: 110 },
    aroon: { up: 40 },
    rsi: 80,
  };
  const sig = runStrategy(BBRevert, ind);
  expect(sig).toBe('sell');
});
