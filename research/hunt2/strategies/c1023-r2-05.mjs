// c1023 round-2 spec r2-05 (campaign-1023/prereg-r2.json, frozen before code).
// Low-BTC-correlation sleeve with a 70th-percentile hold buffer (Novy-Marx & Velikov 2016). Monthly, long-only.
export const meta = {
  id: "c1023-r2-05",
  name: "Low BTC-correlation sleeve, bottom half, with a 70th-percentile hold buffer, monthly",
  family: "equity-factors",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 90, need: 92, minNames: 8, holdPct: 0.7, selectPct: 0.5 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

function pearson(xs, ys) {
  const n = xs.length;
  let mx = 0;
  let my = 0;
  for (let j = 0; j < n; j++) {
    mx += xs[j];
    my += ys[j];
  }
  mx /= n;
  my /= n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let j = 0; j < n; j++) {
    sxy += (xs[j] - mx) * (ys[j] - my);
    sxx += (xs[j] - mx) ** 2;
    syy += (ys[j] - my) ** 2;
  }
  const d = Math.sqrt(sxx * syy);
  return d > 0 ? sxy / d : NaN;
}

export function rank(universe, t, ctx) {
  const { window, need, minNames, holdPct, selectPct } = ctx.params;
  if (ctx.state.H === undefined) ctx.state.H = [];
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) {
    ctx.state.H = [];
    return ew(universe);
  }

  const eB = btc.length - 1;
  const rB = [];
  for (let k = eB - window + 1; k <= eB; k++) rB.push(ret(btc, k));

  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < need) continue;
    const e = b.length - 1;
    const rs = [];
    for (let k = e - window + 1; k <= e; k++) rs.push(ret(b, k));
    const corr = sym === "BTCUSDT" ? 1 : pearson(rs, rB);
    if (Number.isFinite(corr)) rows.push([sym, corr]);
  }
  const n = rows.length;
  if (n < minNames) {
    ctx.state.H = [];
    return ew(universe);
  }

  rows.sort((x, y) => x[1] - y[1] || cmp(x[0], y[0]));
  const pos = new Map();
  rows.forEach(([sym], idx) => pos.set(sym, idx));
  // percentile p_s = (position - 1) / (n - 1), position 1 = lowest correlation
  const pct = (sym) => pos.get(sym) / (n - 1);

  let H = ctx.state.H.filter((s) => pos.has(s) && pct(s) <= holdPct);
  const target = Math.ceil(selectPct * n);
  for (const [sym] of rows) {
    if (H.length >= target) break;
    if (!H.includes(sym)) H.push(sym);
  }
  ctx.state.H = H;

  const out = {};
  for (const s of H) out[s] = 1 / H.length;
  return out;
}
