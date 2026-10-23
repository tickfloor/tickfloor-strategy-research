// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-05). Gulen & Petkova 2018, 'Absolute strength: exploring momentum in stock returns', working paper (Purdue / Rice), SSRN 2638004
export const meta = {
  id: "c1022-acad-05__rob2",
  name: "Absolute strength momentum: long only when 12-1 return clears a fixed historical percentile (Gulen-Petkova) (+25%)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { form: 315, skip: 21, pct: 0.9, minPoolMonths: 24 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  if (ctx.state.pool === undefined) ctx.state.pool = [];
  const pool = ctx.state.pool;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 316) continue;
    names.push({ sym, mom: b[L - 1 - p.skip].close / b[L - 1 - p.form].close - 1 });
  }
  let picks = [];
  if (pool.length >= p.minPoolMonths) {
    const vals = pool.flat().sort((x, y) => x - y);
    const thr = vals[Math.floor(p.pct * (vals.length - 1))];
    picks = names.filter((n) => n.mom >= thr);
  }
  pool.push(names.map((n) => n.mom));
  if (!picks.length) return {};
  const w = {};
  for (const n of picks) w[n.sym] = 1 / picks.length;
  return w;
}
