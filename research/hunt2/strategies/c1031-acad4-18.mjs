// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-18). Banz 1981, Journal of Financial Economics 9(1), 3-18
export const meta = {
  id: "c1031-acad4-18",
  name: "Size effect via dollar volume: long the smallest fifth by 63-day dollar volume, monthly (Banz)",
  family: "other",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { window: 63, bottomFrac: 0.2 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (b.length < p.window + 1) continue;
    let s = 0;
    for (let k = e - p.window + 1; k <= e; k++) s += b[k].close * b[k].volume;
    scored.push([sym, s / p.window]);
  }
  const n = Math.floor(p.bottomFrac * scored.length);
  if (n < 3) return {};
  scored.sort((u, v) => u[1] - v[1] || (u[0] < v[0] ? -1 : u[0] > v[0] ? 1 : 0));
  const w = {};
  for (const [sym] of scored.slice(0, n)) w[sym] = 1 / n;
  return w;
}
