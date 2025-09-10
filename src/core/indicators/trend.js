export function trend(close, bbMid, aroonUp, aroonDown) {
  if (bbMid == null || aroonUp == null || aroonDown == null) return 'range';
  if (close > bbMid && aroonUp > aroonDown + 20) return 'up';
  if (close < bbMid && aroonDown > aroonUp + 20) return 'down';
  return 'range';
}
