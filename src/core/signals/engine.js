export function runStrategy(strategy, indicators) {
  if (!strategy) return null;
  if (Array.isArray(strategy.rules)) {
    for (const rule of strategy.rules) {
      if (rule.when(indicators)) return rule.signal;
    }
    return null;
  }
  if (typeof strategy.entry === 'function') {
    const entry = strategy.entry(indicators);
    if (entry) return entry;
  }
  if (typeof strategy.exit === 'function') {
    const exit = strategy.exit(indicators);
    if (exit) return exit;
  }
  return null;
}
