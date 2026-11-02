// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-22). Drop the 8 weakest 12-1 momentum names, hold the rest, monthly.
export const meta = {
  id: "c1031-stockxs-22",
  name: "Exclusion screen: hold the other 32 of 40 large caps after dropping the 8 weakest 12-1 momentum names, monthly",
  family: "momentum",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { formation: 252, skip: 21, drop: 8 },
};

const ok = (x) => Number.isFinite(x) && x > 0;

export function rank(universe, t, ctx) {
  const { formation: F, skip, drop } = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe).sort()) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < F + 1) continue;
    let good = true;
    for (let k = e - F; k <= e; k++) if (!ok(b[k].close)) { good = false; break; }
    if (!good) continue;
    names.push({ sym, m: b[e - skip].close / b[e - F].close - 1 });
  }
  const n = names.length;
  if (n < 30) return {};
  names.sort((x, y) => x.m - y.m || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const x of names.slice(drop)) w[x.sym] = 1 / (n - drop);
  return w;
}
