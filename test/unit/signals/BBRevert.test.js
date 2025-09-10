import { runStrategy } from '../../../src/core/signals/engine.js';
import BBRevert from '../../../src/core/signals/strategies/BBRevert.js';

test('entry returns buy when conditions met', () => {
  const ind = {
    close: 90,
    bbands: { lower: 100, upper: 110 },
    aroon: { up: 60 },
    rsi: 50,
  };
  const sig = runStrategy(BBRevert, ind);
  expect(sig).toBe('buy');
});

test('exit returns sell when close above upper band', () => {
  const ind = {
    close: 120,
    bbands: { lower: 100, upper: 110 },
    aroon: { up: 40 },
    rsi: 50,
  };
  const sig = runStrategy(BBRevert, ind);
  expect(sig).toBe('sell');
});

test('no signal when rsi below 70 and price inside bands', () => {
  const ind = {
    close: 105,
    bbands: { lower: 100, upper: 110 },
    aroon: { up: 40 },
    rsi: 65,
  };
  const sig = runStrategy(BBRevert, ind);
  expect(sig).toBe('sell');
});
