// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-47), frozen before code.
// Refs: George & Hwang 2004 JF (52-week high); Jegadeesh & Titman 1993 JF; Asness et al. 2013 JF.
export const meta = {
  id: "c1022-redteam-47",
  name: "Composite momentum: average rank of 12-1, 6-1 and distance to 52-week high, top 15%",
  family: "momentum",
  source: "c1022/redteam",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { long: 252, short: 126, skip: 21, highWindow: 252, frac: 0.15, need: 254, minNames: 50 },
};

function ew(syms) {
  const w = {};
  for (const s of syms) w[s] = 1 / syms.length;
  return w;
}

// percentile rank of each row by key: ascending rank r (ties by name), p = (r - 1) / (n - 1)
function pct(rows, key) {
  const n = rows.length;
  const idx = rows.map((_, i) => i);
  idx.sort((x, y) => rows[x][key] - rows[y][key] || (rows[x].s < rows[y].s ? -1 : rows[x].s > rows[y].s ? 1 : 0));
  const p = new Array(n);
  idx.forEach((i, r) => { p[i] = r / (n - 1); });
  return p;
}

export function rank(universe, t, ctx) {
  const P = ctx.params;
  const syms = Object.keys(universe);
  if (syms.length === 0) return {};
  const rows = [];
  for (const s of syms) {
    const b = universe[s];
    if (b.length < P.need) continue;
    const e = b.length - 1;
    const a = b[e - P.skip].close / b[e - P.long].close - 1;
    const c = b[e - P.skip].close / b[e - P.short].close - 1;
    let hi = -Infinity;
    for (let j = e - P.highWindow + 1; j <= e; j++) if (b[j].high > hi) hi = b[j].high;
    rows.push({ s, a, c, h: b[e].close / hi });
  }
  const n = rows.length;
  if (n < P.minNames) return ew(syms);
  const pa = pct(rows, "a");
  const pc = pct(rows, "c");
  const ph = pct(rows, "h");
  const scored = rows.map((r, i) => ({ s: r.s, score: (pa[i] + pc[i] + ph[i]) / 3 }));
  scored.sort((x, y) => y.score - x.score || (x.s < y.s ? -1 : x.s > y.s ? 1 : 0));
  const k = Math.round(P.frac * n);
  const w = {};
  for (const r of scored.slice(0, k)) w[r.s] = 1 / k;
  return w;
}
