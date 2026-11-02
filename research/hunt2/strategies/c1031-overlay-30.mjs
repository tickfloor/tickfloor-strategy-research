// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-30), frozen before code.
export const meta = {
  id: "c1031-overlay-30",
  name: "Own-history volatility percentile ladder on 25 ETFs: full below the 75th percentile, half 75th-90th, zero above the 90th, weekly",
  family: "volatility",
  source: "c1031/overlay",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "weekly",
  warmup: 532,
  params: { sigmaWin: 21, histBars: 504, halfPct: 0.75, zeroPct: 0.9, need: 526 },
};

const sd = (xs) => {
  const n = xs.length;
  const m = xs.reduce((a, v) => a + v, 0) / n;
  let ss = 0;
  for (const v of xs) ss += (v - m) * (v - m);
  return Math.sqrt(ss / (n - 1));
};

const rets = (b) => {
  const r = new Array(b.length).fill(NaN);
  for (let k = 1; k < b.length; k++) r[k] = b[k].close / b[k - 1].close - 1;
  return r;
};

// Share of the last histBars rolling sample stds that are <= the latest one, mapped to the exposure ladder.
const exposure = (b, p) => {
  const r = rets(b);
  const e = b.length - 1;
  const sigAt = (k) => sd(r.slice(k - p.sigmaWin + 1, k + 1));
  const sigE = sigAt(e);
  let le = 0;
  for (let k = e - p.histBars + 1; k <= e; k++) if (sigAt(k) <= sigE) le++;
  const q = le / p.histBars;
  return q < p.halfPct ? 1 : q < p.zeroPct ? 0.5 : 0;
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  const w = {};
  for (const s of syms) w[s] = exposure(universe[s], p) / N;
  return w;
}
