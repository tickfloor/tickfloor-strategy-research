// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-60). Portfolio rank mode, monthly.
// Kelly & Jiang 2014: long the top 20% by loading on innovations in cross-sectional tail risk (Hill estimator).

export const meta = {
  id: "c1022-acad-60",
  name: "Tail-risk beta: long the quintile whose returns load most on innovations in cross-sectional tail risk (Kelly-Jiang)",
  family: "volatility",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { tailPct: 0.05, betaMonths: 24, topFrac: 0.2 },
};

const monthKey = (sec) => { const d = new Date(sec * 1000); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };

export function rank(universe, t, ctx) {
  const { tailPct, betaMonths, topFrac } = ctx.params;
  const cur = monthKey(t);
  const elig = Object.keys(universe).filter((s) => universe[s].length > 540);
  if (elig.length < 3) return {};
  const startKey = cur - betaMonths - 2; // buffer for lambda and innovation lags

  // complete-month daily returns pooled across eligible names, and month-end closes per name
  const pool = new Map();
  const lastClose = {};
  for (const sym of elig) {
    const b = universe[sym];
    const lc = new Map();
    lastClose[sym] = lc;
    for (let k = b.length - 1; k >= 1; k--) {
      const key = monthKey(b[k].time);
      if (key >= cur) continue;
      if (key < startKey) break;
      if (!lc.has(key)) lc.set(key, b[k].close);
      if (!pool.has(key)) pool.set(key, []);
      pool.get(key).push(b[k].close / b[k - 1].close - 1);
    }
  }

  // Hill lower-tail estimator of tail risk per month
  const lambda = new Map();
  for (let m = cur - betaMonths - 1; m < cur; m++) {
    const r = (pool.get(m) || []).slice().sort((a, c) => a - c);
    if (r.length < 20) continue;
    const u = r[Math.floor(tailPct * r.length)];
    let s = 0, c = 0;
    for (const x of r) if (x < u) { s += Math.log(x / u); c++; }
    if (c > 0 && Number.isFinite(s / c)) lambda.set(m, s / c);
  }
  // innovation d_m = lambda_m - lambda_{m-1} for the last betaMonths months
  const d = new Map();
  for (let m = cur - betaMonths; m < cur; m++) {
    if (lambda.has(m) && lambda.has(m - 1)) d.set(m, lambda.get(m) - lambda.get(m - 1));
  }

  const scores = [];
  for (const sym of elig) {
    const lc = lastClose[sym];
    const xs = [], ys = [];
    for (let m = cur - betaMonths; m < cur; m++) {
      const c1 = lc.get(m), c0 = lc.get(m - 1);
      if (c1 === undefined || c0 === undefined || !d.has(m)) continue;
      ys.push(c1 / c0 - 1);
      xs.push(d.get(m));
    }
    if (ys.length < 24) continue;
    const n = xs.length;
    const xMean = xs.reduce((a, v) => a + v, 0) / n;
    const yMean = ys.reduce((a, v) => a + v, 0) / n;
    let sxy = 0, sxx = 0;
    for (let j = 0; j < n; j++) {
      sxy += (xs[j] - xMean) * (ys[j] - yMean);
      sxx += (xs[j] - xMean) ** 2;
    }
    if (Number.isFinite(sxy / sxx)) scores.push({ sym, beta: sxy / sxx });
  }
  const k = Math.floor(topFrac * scores.length);
  if (k < 3) return {};
  scores.sort((a, c) => c.beta - a.beta);
  const w = {};
  for (const x of scores.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
