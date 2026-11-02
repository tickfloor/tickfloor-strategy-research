// c1031 round-4 spec c1031-r4-08 (campaign-1031/prereg-r4.json, frozen before code).
// c1024-r3-02 sleeve (low BTC-correlation, 70th-percentile hold buffer, inverse-vol sizing) with a Fear & Greed gate: cash when FNG <= 40. Monthly, long-only.
export const meta = {
  id: "c1031-r4-08__rob2",
  name: "r3-02 low-correlation sleeve in greed and neutral, cash in fear (Fear & Greed <= 40), monthly (+25%)",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 113, need: 115, minNames: 8, holdPct: 0.7, selectPct: 0.5, fear: 40 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;
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

// Sleeve with the hold buffer; updates ctx.state.H on every call (fear months included).
function sleeve(universe, ctx) {
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
    if (Number.isFinite(corr)) rows.push({ sym, corr, sigma: sampleStd(rs) });
  }
  const n = rows.length;
  if (n < minNames) {
    ctx.state.H = [];
    return ew(universe);
  }

  rows.sort((x, y) => x.corr - y.corr || cmp(x.sym, y.sym));
  const pos = new Map();
  rows.forEach((r, idx) => pos.set(r.sym, idx));
  // percentile p_s = (position - 1) / (n - 1), position 1 = lowest correlation
  const pct = (sym) => pos.get(sym) / (n - 1);

  const H = ctx.state.H.filter((s) => pos.has(s) && pct(s) <= holdPct);
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

export function rank(universe, t, ctx) {
  const weights = sleeve(universe, ctx);
  const g = ctx.macro("FNG");
  if (g != null && g <= ctx.params.fear) return {};
  return weights;
}
