export function hhll(highs, lows, window = 3) {
  const len = highs.length;
  if (len < window * 2 + 1) return 'N/A';

  const swingHighs = [];
  const swingLows = [];

  for (let i = window; i < len - window; i++) {
    const high = highs[i];
    let isHigh = true;
    for (let j = i - window; j <= i + window; j++) {
      if (highs[j] > high) {
        isHigh = false;
        break;
      }
    }
    if (isHigh) swingHighs.push(high);

    const low = lows[i];
    let isLow = true;
    for (let j = i - window; j <= i + window; j++) {
      if (lows[j] < low) {
        isLow = false;
        break;
      }
    }
    if (isLow) swingLows.push(low);
  }

  if (swingHighs.length < 2 || swingLows.length < 2) return 'N/A';
  const [prevHigh, currHigh] = swingHighs.slice(-2);
  const [prevLow, currLow] = swingLows.slice(-2);

  if (currHigh > prevHigh && currLow > prevLow) return 'HH';
  if (currHigh > prevHigh && currLow < prevLow) return 'HL';
  if (currHigh < prevHigh && currLow > prevLow) return 'LH';
  if (currHigh < prevHigh && currLow < prevLow) return 'LL';
  if (currHigh === prevHigh && currLow === prevLow) return 'EQ';
  return 'N/A';
}
