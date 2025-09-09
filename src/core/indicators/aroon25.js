export function aroon25(highs, lows) {
  const period = 25;
  if (highs.length < period) return null;
  const sliceH = highs.slice(-period);
  const sliceL = lows.slice(-period);
  const highIndex = sliceH.lastIndexOf(Math.max(...sliceH));
  const lowIndex = sliceL.lastIndexOf(Math.min(...sliceL));
  const up = ((period - 1 - highIndex) / (period - 1)) * 100;
  const down = ((period - 1 - lowIndex) / (period - 1)) * 100;
  return { up, down };
}
