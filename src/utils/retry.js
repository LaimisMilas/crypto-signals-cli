export async function retry(fn, { retries = 3, factor = 2, minTimeout = 500 } = {}) {
  let attempt = 0;
  for (;;) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      let delay = minTimeout * Math.pow(factor, attempt);
      if (err && typeof err.retryAfter === 'number') {
        delay = Math.max(delay, err.retryAfter);
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
}
