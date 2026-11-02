// c1031 round-4 spec c1031-r4-07 (campaign-1031/prereg-r4.json, frozen before code).
// Low correlation to the equal-weight alt index (BTC excluded, leave-one-out), bottom half with a 70th-percentile
// hold buffer, inverse-vol sizing. Monthly, long-only.
export const meta = {
  id: "c1031-r4-07",
  name: "Low correlation to the equal-weight alt index excluding BTC (leave-one-out), bottom half, 70th-percentile hold buffer, inverse-vol sizing, monthly",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 90, need: 92, minNames: 8, holdPct: 0.7, selectPct: 0.5 },
};

const retAt = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

function mean(xs) {
  let m = 0;
  for (const x of xs) m += x;
  return m / xs.length;
}

function sampleStd(xs) {
  const m = mean(xs);
  let s = 0;
  for (const x of xs) s += (x - m) ** 2;
  return Math.sqrt(s / (xs.length - 1));
}

function pearson(xs, ys) {
  const mx = mean(xs);
  const my = mean(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let j = 0; j < xs.length; j++) {
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
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  if (elig.length < minNames) {
    ctx.state.H = [];
    return ew(universe);
  }
  const alts = elig.filter((s) => s !== "BTCUSDT");
  if (alts.length < 4) {
    ctx.state.H = [];
    return ew(universe);
  }

  // per window offset j (0 = latest bar), sum of alt returns; the reference for s drops s itself
  const altSum = new Array(window).fill(0);
  for (const s of alts) {
    const b = universe[s], e = b.length - 1;
    for (let j = 0; j < window; j++) altSum[j] += retAt(b, e - j);
  }

  const rows = [];
  for (const s of elig) {
    const b = universe[s], e = b.length - 1;
    const rs = [];
    for (let j = 0; j < window; j++) rs.push(retAt(b, e - j));
    const isAlt = s !== "BTCUSDT";
    const cnt = alts.length - (isAlt ? 1 : 0);
    const ref = [];
    for (let j = 0; j < window; j++) ref.push((altSum[j] - (isAlt ? rs[j] : 0)) / cnt);
    const corr = pearson(rs, ref);
    const sigma = sampleStd(rs);
    if (Number.isFinite(corr) && sigma > 0) rows.push({ sym: s, corr, sigma });
  }
  const n = rows.length;
  if (n < minNames) {
    ctx.state.H = [];
    return ew(universe);
  }

  rows.sort((x, y) => x.corr - y.corr || cmp(x.sym, y.sym));
  const pos = new Map();
  rows.forEach((r, idx) => pos.set(r.sym, idx));

  // hold set carried in ctx.state: drop unscored or beyond the 70th percentile, then fill to ceil(selectPct * n)
  const H = ctx.state.H.filter((s) => pos.has(s) && pos.get(s) / (n - 1) <= holdPct);
  const target = Math.ceil(selectPct * n);
  for (const r of rows) {
    if (H.length >= target) break;
    if (!H.includes(r.sym)) H.push(r.sym);
  }
  ctx.state.H = H;

  const sig = new Map(rows.map((r) => [r.sym, r.sigma]));
  const invSum = H.reduce((a, s) => a + 1 / sig.get(s), 0);
  const out = {};
  for (const s of H) out[s] = 1 / sig.get(s) / invSum;
  return out;
}
