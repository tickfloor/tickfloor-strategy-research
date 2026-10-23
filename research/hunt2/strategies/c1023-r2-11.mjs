// c1023 round-2 spec r2-11 (campaign-1023/prereg-r2.json, frozen before code).
// Volatility-neutralised 90-bar momentum (cross-sectional OLS residual), top 20% with a 50% hold buffer. Daily, long-only.
export const meta = {
  id: "c1023-r2-11",
  name: "Vol-neutralised 90-day momentum (top 20%) with a 50% hold buffer, daily",
  family: "momentum",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  params: { lookback: 90, topFrac: 0.2, bufferFrac: 0.5, minRows: 6 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

export function rank(universe, t, ctx) {
  const { lookback, topFrac, bufferFrac, minRows } = ctx.params;
  if (ctx.state.H === undefined) ctx.state.H = [];

  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < lookback + 2) continue;
    const e = b.length - 1;
    const mom = b[e].close / b[e - lookback].close - 1;
    let ss = 0;
    for (let k = e - lookback + 1; k <= e; k++) ss += ret(b, k) ** 2;
    rows.push({ sym, mom, vol: Math.sqrt(ss / lookback) });
  }

  const M = rows.length;
  if (M < minRows) {
    ctx.state.H = [];
    return {};
  }

  // cross-sectional OLS: mom = a + b * vol; residual = momentum not explained by volatility
  const mv = rows.reduce((a, r) => a + r.vol, 0) / M;
  const mm = rows.reduce((a, r) => a + r.mom, 0) / M;
  let sxy = 0;
  let sxx = 0;
  for (const r of rows) {
    sxy += (r.vol - mv) * (r.mom - mm);
    sxx += (r.vol - mv) ** 2;
  }
  const slope = sxy / sxx;
  const icpt = mm - slope * mv;
  for (const r of rows) r.resid = r.mom - (icpt + slope * r.vol);

  const ranked = [...rows].sort((x, y) => y.resid - x.resid || cmp(x.sym, y.sym));
  const rankOf = new Map(ranked.map((r, i) => [r.sym, i + 1]));
  const K = Math.max(1, Math.round(topFrac * M));
  const B = Math.ceil(bufferFrac * M);

  let keep = ctx.state.H.filter((s) => rankOf.has(s) && rankOf.get(s) <= B);
  for (const r of ranked) {
    if (keep.length >= K) break;
    if (!keep.includes(r.sym)) keep.push(r.sym);
  }
  if (keep.length > K) keep = keep.sort((a, b) => rankOf.get(a) - rankOf.get(b)).slice(0, K);
  ctx.state.H = keep;

  const out = {};
  for (const s of keep) out[s] = 1 / keep.length;
  return out;
}
