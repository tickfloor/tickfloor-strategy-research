// c1023 round-2 spec r2-03 (campaign-1023/prereg-r2.json, frozen before code).
// Bottom-half BTC-correlation picks sized by inverse realised volatility (risk parity inside the factor). Monthly, long-only.
export const meta = {
  id: "c1023-r2-03__rob1",
  name: "Low BTC-correlation picks (bottom half) sized by inverse realised volatility, monthly (-25%)",
  family: "equity-factors",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 68, need: 70, minNames: 8, selectFrac: 0.5 },
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

function sampleStd(xs) {
  const n = xs.length;
  let m = 0;
  for (const x of xs) m += x;
  m /= n;
  let s = 0;
  for (const x of xs) s += (x - m) ** 2;
  return Math.sqrt(s / (n - 1));
}

export function rank(universe, t, ctx) {
  const { window, need, minNames, selectFrac } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return ew(universe);

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
  if (n < minNames) return ew(universe);

  rows.sort((x, y) => x.corr - y.corr || cmp(x.sym, y.sym));
  const H = rows.slice(0, Math.floor(selectFrac * n));
  const invSum = H.reduce((a, r) => a + 1 / r.sigma, 0);
  const out = {};
  for (const r of H) out[r.sym] = 1 / r.sigma / invSum;
  return out;
}
