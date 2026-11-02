// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-02). Garman & Klass (1980) J. Business 53(1); Moreira & Muir (2017) JF 72(4)
export const meta = {
  id: "c1031-overlay-02",
  name: "ETF Garman-Klass range-volatility target: each of 25 ETFs capped to 12% annual volatility, weekly",
  family: "volatility",
  source: "c1031/overlay",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { window: 21, targetVol: 0.12, annualise: 252, need: 22 },
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
    let sum = 0;
    for (let k = e - p.window + 1; k <= e; k++) {
      const x = b[k];
      const hl = Math.log(x.high / x.low);
      const co = Math.log(x.close / x.open);
      sum += 0.5 * hl * hl - (2 * Math.LN2 - 1) * co * co;
    }
    const mean = sum / p.window;
    const xs = mean <= 0 ? 1 : Math.min(1, p.targetVol / Math.sqrt(mean * p.annualise));
    w[s] = xs / N;
  }
  return w;
}
