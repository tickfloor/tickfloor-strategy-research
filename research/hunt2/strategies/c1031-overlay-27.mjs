// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-27), frozen before code.
export const meta = {
  id: "c1031-overlay-27",
  name: "Monthly MACD trend filter on 25 ETFs: hold while the monthly MACD(12,26,9) is above its signal line",
  family: "trend",
  source: "c1031/overlay",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  warmup: 720,
  params: { fast: 12, slow: 26, signal: 9 },
};

// EMA seeded with the SMA of the first n values; NaN before index n-1.
const ema = (xs, n) => {
  const out = new Array(xs.length).fill(NaN);
  if (xs.length < n) return out;
  const a = 2 / (n + 1);
  let prev = xs.slice(0, n).reduce((s, v) => s + v, 0) / n;
  out[n - 1] = prev;
  for (let k = n; k < xs.length; k++) {
    prev = a * xs[k] + (1 - a) * prev;
    out[k] = prev;
  }
  return out;
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const done = ctx.resample(bars, "1M").filter((m) => m.complete);
  // ponytail: the monthly value only changes when a month completes, so it is recomputed only then.
  if (ctx.state.n === done.length) return ctx.state.on;
  ctx.state.n = done.length;
  ctx.state.on = 0;
  if (done.length < 34) return 0;
  const c = done.map((m) => m.close);
  const f = ema(c, p.fast);
  const s = ema(c, p.slow);
  const macd = c.map((_, k) => f[k] - s[k]);
  const first = macd.findIndex((v) => Number.isFinite(v));
  const sig = ema(macd.slice(first), p.signal);
  const macdLast = macd[c.length - 1];
  const sigLast = sig[sig.length - 1];
  if (!Number.isFinite(macdLast) || !Number.isFinite(sigLast)) return 0;
  ctx.state.on = macdLast > sigLast ? 1 : 0;
  return ctx.state.on;
}
