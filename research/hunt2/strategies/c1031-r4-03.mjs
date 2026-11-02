// c1031 round-4 spec c1031-r4-03 (campaign-1031/prereg-r4.json, frozen before code).
// Intersection of the low-BTC-correlation half and the high-VaR half; falls back to the low-correlation half when the intersection has fewer than minHold names. Monthly, long-only.
export const meta = {
  id: "c1031-r4-03",
  name: "Crypto intersection of the bottom half by BTC correlation and the top half by 180-day value-at-risk, monthly",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { corrWindow: 90, varWindow: 180, q: 0.05, k: 9, need: 181, minNames: 12, minHold: 3 },
};

const ret = (b, j) => b[j].close / b[j - 1].close - 1;
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
  const { corrWindow, varWindow, k, need, minNames, minHold } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return ew(universe);

  const eB = btc.length - 1;
  const rB = [];
  for (let j = eB - corrWindow + 1; j <= eB; j++) rB.push(ret(btc, j));

  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < need) continue;
    const e = b.length - 1;
    const rs = [];
    for (let j = e - corrWindow + 1; j <= e; j++) rs.push(ret(b, j));
    const corr = sym === "BTCUSDT" ? 1 : pearson(rs, rB);
    if (!Number.isFinite(corr)) continue;
    const vr = [];
    for (let j = 0; j < varWindow; j++) vr.push(ret(b, e - j));
    vr.sort((x, y) => x - y);
    rows.push({ sym, corr, va: -vr[k - 1] });
  }
  const n = rows.length;
  if (n < minNames) return ew(universe);

  const half = Math.ceil(n / 2);
  const lo = rows
    .slice()
    .sort((x, y) => x.corr - y.corr || cmp(x.sym, y.sym))
    .slice(0, half)
    .map((r) => r.sym);
  const hv = rows
    .slice()
    .sort((x, y) => y.va - x.va || cmp(x.sym, y.sym))
    .slice(0, half)
    .map((r) => r.sym);
  const I = lo.filter((s) => hv.includes(s));
  const H = I.length >= minHold ? I : lo;

  const out = {};
  for (const s of H) out[s] = 1 / H.length;
  return out;
}
