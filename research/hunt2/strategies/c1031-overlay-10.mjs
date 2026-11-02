// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-10). Grossman & Zhou (1993) Mathematical Finance 3(3)
export const meta = {
  id: "c1031-overlay-10",
  name: "Grossman-Zhou drawdown control on 25 ETFs: exposure = 1 - drawdown/20% from the 252-day closing high, weekly",
  family: "drawdown-control",
  source: "c1031/overlay",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "weekly",
  longShort: false,
  warmup: 257,
  params: { peakWin: 252, alpha: 0.2, need: 252 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= p.need);
  const N = syms.length;
  if (N === 0) return {};
  const w = {};
  for (const s of syms) {
    const b = universe[s];
    const e = b.length - 1;
    let peak = -Infinity;
    for (let k = e - p.peakWin + 1; k <= e; k++) peak = Math.max(peak, b[k].close);
    const dd = 1 - b[e].close / peak;
    w[s] = Math.max(0, 1 - dd / p.alpha) / N;
  }
  return w;
}
