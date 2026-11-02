// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-24). Hou & Moskowitz 2005, Review of Financial Studies 18(3), 981-1020; Borgards & Czudaj 2020, JIFMIM 71, 101291
export const meta = {
  id: "c1031-acad4-24",
  name: "Crypto price delay: long the 6 coins that react most slowly to the crypto market, weekly (Hou-Moskowitz)",
  family: "other",
  source: "c1031/acad4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  longShort: false,
  params: { window: 90, lags: 4, top: 6 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;

// R^2 of an OLS fit of y on the columns of X (X rows include the intercept as the first column).
function olsR2(y, X) {
  const p = X[0].length;
  const A = [];
  for (let a = 0; a < p; a++) {
    A.push(new Array(p + 1).fill(0));
    for (let c = 0; c < p; c++) for (let r = 0; r < y.length; r++) A[a][c] += X[r][a] * X[r][c];
    for (let r = 0; r < y.length; r++) A[a][p] += X[r][a] * y[r];
  }
  for (let col = 0; col < p; col++) {
    let piv = col;
    for (let r = col + 1; r < p; r++) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    if (Math.abs(A[piv][col]) < 1e-12) return NaN;
    [A[col], A[piv]] = [A[piv], A[col]];
    for (let r = 0; r < p; r++) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      for (let c = col; c <= p; c++) A[r][c] -= f * A[col][c];
    }
  }
  const beta = A.map((row, a) => row[p] / row[a]);
  const mean = y.reduce((s, v) => s + v, 0) / y.length;
  let ssr = 0, sst = 0;
  for (let r = 0; r < y.length; r++) {
    let yhat = 0;
    for (let a = 0; a < p; a++) yhat += beta[a] * X[r][a];
    ssr += (y[r] - yhat) ** 2;
    sst += (y[r] - mean) ** 2;
  }
  return sst > 0 ? 1 - ssr / sst : NaN;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const minL = p.window + p.lags + 1;
  const syms = Object.keys(universe).filter((s) => universe[s].length >= minL);
  if (syms.length < p.top) return {};
  // every coin's last bar is the rebalance day, so index by offset d back from its own last bar
  const span = p.window + p.lags;
  const m = [];
  for (let d = 0; d < span; d++) {
    let s = 0;
    for (const sym of syms) { const b = universe[sym]; s += ret(b, b.length - 1 - d); }
    m.push(s / syms.length);
  }
  const scored = [];
  for (const sym of syms) {
    const b = universe[sym];
    const L = b.length;
    const y = [], xr = [], xu = [];
    for (let d = 0; d < p.window; d++) {
      y.push(ret(b, L - 1 - d));
      xr.push([1, m[d]]);
      const row = [1];
      for (let l = 0; l <= p.lags; l++) row.push(m[d + l]);
      xu.push(row);
    }
    const r2r = olsR2(y, xr);
    const r2u = olsR2(y, xu);
    if (!(r2u > 0) || !Number.isFinite(r2r)) continue;
    scored.push([sym, 1 - r2r / r2u]);
  }
  if (scored.length < p.top) return {};
  scored.sort((u, v) => v[1] - u[1] || (u[0] < v[0] ? -1 : u[0] > v[0] ? 1 : 0));
  const w = {};
  for (const [sym] of scored.slice(0, p.top)) w[sym] = 1 / p.top;
  return w;
}
