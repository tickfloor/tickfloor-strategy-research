// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-11). Inverse 63-day volatility weights, monthly.
export const meta = {
  id: "c1031-stockxs-11",
  name: "Inverse-volatility weights: all 40 large caps weighted by 1 over their 63-day volatility, monthly",
  family: "volatility",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { window: 63 },
};

const ok = (x) => Number.isFinite(x) && x > 0;

export function rank(universe, t, ctx) {
  const W = ctx.params.window;
  const names = [];
  for (const sym of Object.keys(universe).sort()) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < W + 1) continue;
    let good = true;
    for (let k = e - W; k <= e; k++) if (!ok(b[k].close)) { good = false; break; }
    if (!good) continue;
    const rets = [];
    for (let k = e - W + 1; k <= e; k++) rets.push(b[k].close / b[k - 1].close - 1);
    const mu = rets.reduce((s, x) => s + x, 0) / W;
    const sd = Math.sqrt(rets.reduce((s, x) => s + (x - mu) * (x - mu), 0) / (W - 1));
    if (!(sd > 0) || !Number.isFinite(sd)) continue;
    names.push({ sym, inv: 1 / sd });
  }
  if (names.length < 30) return {};
  const tot = names.reduce((s, n) => s + n.inv, 0);
  const w = {};
  for (const n of names) w[n.sym] = n.inv / tot;
  return w;
}
