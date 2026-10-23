// c1024 round-3 spec c1024-r3-01 (campaign-1024/prereg-r3.json, frozen before code).
// Residual volatility to BTC (90-day OLS): hold the top half by residual vol, sized by inverse total vol. Monthly, long-only.
export const meta = {
  id: "c1024-r3-01",
  name: "Residual volatility to BTC (90-day OLS), top half by residual vol sized by inverse realised volatility, monthly",
  family: "volatility",
  source: "c1024/r3",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 90, need: 92, minNames: 8, selectFrac: 0.5 },
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

export function rank(universe, t, ctx) {
  const { window, need, minNames, selectFrac } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return ew(universe);

  const eB = btc.length - 1;
  const xB = [];
  for (let k = eB - window + 1; k <= eB; k++) xB.push(ret(btc, k));
  const mx = mean(xB);
  let vx = 0;
  for (const x of xB) vx += (x - mx) ** 2;

  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < need) continue;
    const e = b.length - 1;
    const rs = [];
    for (let k = e - window + 1; k <= e; k++) rs.push(ret(b, k));
    const mr = mean(rs);
    let cov = 0;
    for (let j = 0; j < window; j++) cov += (rs[j] - mr) * (xB[j] - mx);
    const beta = cov / vx;
    const alpha = mr - beta * mx;
    const resid = rs.map((r, j) => r - alpha - beta * xB[j]);
    const ivol = sym === "BTCUSDT" ? 0 : sampleStd(resid);
    rows.push({ sym, ivol, sigma: sampleStd(rs) });
  }
  const n = rows.length;
  if (n < minNames) return ew(universe);

  rows.sort((x, y) => y.ivol - x.ivol || cmp(x.sym, y.sym));
  const H = rows.slice(0, Math.floor(selectFrac * n));
  const invSum = H.reduce((a, r) => a + 1 / r.sigma, 0);
  const out = {};
  for (const r of H) out[r.sym] = 1 / r.sigma / invSum;
  return out;
}
