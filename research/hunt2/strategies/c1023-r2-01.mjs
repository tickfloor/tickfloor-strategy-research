// c1023 round-2 spec r2-01 (campaign-1023/prereg-r2.json, frozen before code).
// Extends c1022-redteam-04: EWMA (60-day half-life, 240-bar span) correlation with BTC, rank-weighted, monthly, long-only.
export const meta = {
  id: "c1023-r2-01",
  name: "Low BTC-correlation sleeve with an exponentially weighted correlation (60-day half-life), rank-weighted, monthly",
  family: "equity-factors",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { halfLife: 60, span: 240, need: 242, minNames: 8 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { halfLife, span, need, minNames } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return ew(universe);

  const lambda = Math.pow(0.5, 1 / halfLife);
  const u = [];
  for (let j = 0; j < span; j++) u.push(Math.pow(lambda, j));
  const uSum = u.reduce((a, x) => a + x, 0);

  // r[j] = return j bars before the latest bar (j = 0 is the latest)
  const series = (b) => {
    const e = b.length - 1;
    const r = new Array(span);
    for (let j = 0; j < span; j++) r[j] = ret(b, e - j);
    return r;
  };
  const wmean = (x) => {
    let s = 0;
    for (let j = 0; j < span; j++) s += u[j] * x[j];
    return s / uSum;
  };
  const wcov = (x, mx, y, my) => {
    let s = 0;
    for (let j = 0; j < span; j++) s += u[j] * (x[j] - mx) * (y[j] - my);
    return s / uSum;
  };

  const rB = series(btc);
  const mB = wmean(rB);
  const vB = wcov(rB, mB, rB, mB);
  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < need) continue;
    if (sym === "BTCUSDT") {
      rows.push([sym, 1]);
      continue;
    }
    const rs = series(b);
    const ms = wmean(rs);
    const corr = wcov(rs, ms, rB, mB) / Math.sqrt(wcov(rs, ms, rs, ms) * vB);
    if (Number.isFinite(corr)) rows.push([sym, corr]);
  }
  if (rows.length < minNames) return ew(universe);

  // highest correlation = position 1 = smallest weight; lowest correlation gets the largest weight
  rows.sort((x, y) => y[1] - x[1] || cmp(x[0], y[0]));
  const n = rows.length;
  const sumQ = (n * (n + 1)) / 2;
  const out = {};
  rows.forEach(([sym], idx) => {
    out[sym] = (idx + 1) / sumQ;
  });
  return out;
}
