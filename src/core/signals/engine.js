export function runStrategy(strategy, indicators) {
  for (const rule of strategy.rules) {
    if (rule.when(indicators)) return rule.signal;
  }
  return null;
}
