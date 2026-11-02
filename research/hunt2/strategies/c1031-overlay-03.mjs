// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-03). Wang & Yan (2021) JBF 131; Moreira & Muir (2017) JF 72(4)
export const meta = {
  id: "c1031-overlay-03",
  name: "Downside-risk target: each large cap sized to 15% annual downside deviation (63 days), weekly",
  family: "volatility",
  source: "c1031/overlay",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { window: 63, targetDownsideDev: 0.15, annualise: 252, need: 64 },
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
    let dd2 = 0;
    for (let k = e - p.window + 1; k <= e; k++) {
      const m = Math.min(b[k].close / b[k - 1].close - 1, 0);
      dd2 += m * m;
    }
    dd2 /= p.window;
    const dsd = Math.sqrt(dd2 * p.annualise);
    const xs = dsd === 0 ? 1 : Math.min(1, p.targetDownsideDev / dsd);
    w[s] = xs / N;
  }
  return w;
}
