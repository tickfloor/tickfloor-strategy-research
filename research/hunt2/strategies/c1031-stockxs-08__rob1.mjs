// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-08), frozen before code.
export const meta = {
  id: "c1031-stockxs-08__rob1",
  name: "Efficiency ratio leaders: the 8 large caps with the smoothest uphill price path over 126 days, monthly (-25%)",
  family: "trend",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: {"window": 95, "top": 8},
};

const ok = (b, a, z) => {
  for (let k = a; k <= z; k++) {
    const c = b[k].close;
    if (!(Number.isFinite(c) && c > 0)) return false;
  }
  return true;
};
const byName = (x, y) => (x.s < y.s ? -1 : x.s > y.s ? 1 : 0);
const equal = (list, n) => {
  const w = {};
  for (const x of list.slice(0, n)) w[x.s] = 1 / n;
  return w;
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const cand = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    const e = b.length - 1;
    const a = e - p.window;
    if (b.length < 96 || !ok(b, a, e)) continue;
    const net = b[e].close - b[a].close;
    if (!(net > 0)) continue;
    let den = 0;
    for (let k = a + 1; k <= e; k++) den += Math.abs(b[k].close - b[k - 1].close);
    if (!(den > 0)) continue;
    cand.push({ s, v: net / den });
  }
  if (cand.length < 3) return {};
  cand.sort((x, y) => y.v - x.v || byName(x, y));
  return equal(cand, p.top);
}
