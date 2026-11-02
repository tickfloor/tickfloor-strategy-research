// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-21). Lowest overnight-gap volatility, monthly.
export const meta = {
  id: "c1031-stockxs-21",
  name: "Low overnight-gap volatility: the 10 large caps with the calmest open-versus-previous-close gaps over 6 months, monthly",
  family: "volatility",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { window: 126, top: 10 },
};

const ok = (x) => Number.isFinite(x) && x > 0;

export function rank(universe, t, ctx) {
  const { window: W, top } = ctx.params;
  const cands = [];
  for (const sym of Object.keys(universe).sort()) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < W + 1) continue;
    let good = true;
    for (let k = e - W; k <= e; k++) if (!ok(b[k].close)) { good = false; break; }
    for (let k = e - W + 1; k <= e && good; k++) if (!ok(b[k].open)) good = false;
    if (!good) continue;
    const gaps = [];
    for (let k = e - W + 1; k <= e; k++) gaps.push(b[k].open / b[k - 1].close - 1);
    const mu = gaps.reduce((s, x) => s + x, 0) / W;
    const sdg = Math.sqrt(gaps.reduce((s, x) => s + (x - mu) * (x - mu), 0) / (W - 1));
    cands.push({ sym, sdg });
  }
  if (cands.length < top) return {};
  cands.sort((x, y) => x.sdg - y.sdg || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const c of cands.slice(0, top)) w[c.sym] = 1 / top;
  return w;
}
