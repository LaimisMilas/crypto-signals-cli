export function sma(values) {
  if (!values.length) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function ema(values, period) {
  const k = 2 / (period + 1);
  return values.reduce((prev, curr, idx) => (idx === 0 ? curr : curr * k + prev * (1 - k)));
}

export function stdev(values) {
  const mean = sma(values);
  const variance = sma(values.map(v => (v - mean) ** 2));
  return Math.sqrt(variance);
}

export function rolling(values, window, fn) {
  const result = [];
  for (let i = window; i <= values.length; i++) {
    result.push(fn(values.slice(i - window, i)));
  }
  return result;
}

// Stateful rolling window helper maintaining running sum, sum of squares,
// and tracking min/max values with their ages. This allows indicators such
// as SMA, ATR, Aroon and Bollinger bands to be updated incrementally
// without slicing arrays on every call.
export class RollingWindow {
  constructor(period) {
    this.period = period;
    this.values = [];
    this.sum = 0;
    this.sumSquares = 0;
    this.index = 0;
    this.maxDeque = [];
    this.minDeque = [];
  }

  // push a new value into the window
  push(value) {
    const idx = this.index++;
    this.values.push({ value, idx });
    this.sum += value;
    this.sumSquares += value * value;

    while (this.maxDeque.length && this.maxDeque[this.maxDeque.length - 1].value <= value) {
      this.maxDeque.pop();
    }
    this.maxDeque.push({ value, idx });

    while (this.minDeque.length && this.minDeque[this.minDeque.length - 1].value >= value) {
      this.minDeque.pop();
    }
    this.minDeque.push({ value, idx });

    if (this.values.length > this.period) {
      const removed = this.values.shift();
      this.sum -= removed.value;
      this.sumSquares -= removed.value * removed.value;
      if (this.maxDeque[0].idx === removed.idx) this.maxDeque.shift();
      if (this.minDeque[0].idx === removed.idx) this.minDeque.shift();
    }
  }

  isFull() {
    return this.values.length === this.period;
  }

  avg() {
    return this.isFull() ? this.sum / this.period : null;
  }

  variance() {
    if (!this.isFull()) return null;
    const mean = this.sum / this.period;
    return this.sumSquares / this.period - mean * mean;
  }

  std() {
    const v = this.variance();
    return v != null ? Math.sqrt(Math.max(v, 0)) : null;
  }

  max() {
    return this.isFull() ? this.maxDeque[0].value : null;
  }

  min() {
    return this.isFull() ? this.minDeque[0].value : null;
  }

  maxAge() {
    return this.isFull() ? this.index - 1 - this.maxDeque[0].idx : null;
  }

  minAge() {
    return this.isFull() ? this.index - 1 - this.minDeque[0].idx : null;
  }
}
