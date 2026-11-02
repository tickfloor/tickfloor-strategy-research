// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-21), frozen before code.
export const meta = {
  id: "c1031-overlay-21",
  name: "Stale-high exit on 25 ETFs: hold an ETF only if its latest 100-day closing high was set within the last 50 bars, weekly",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "weekly",
  warmup: 105,
  params: { highWin: 100, maxAge: 50, need: 100 },
};

// x = 1 when the latest bar holding the max close over the last highWin bars is at most maxAge bars old.
const exposure = (b, p) => {
  const e = b.length - 1;
  let kh = e - p.highWin + 1;
  for (let k = kh; k <= e; k++) if (b[k].close >= b[kh].close) kh = k;
  return e - kh <= p.maxAge ? 1 : 0;
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  const w = {};
  for (const s of syms) w[s] = exposure(universe[s], p) / N;
  return w;
}
