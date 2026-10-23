// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-63). Portfolio rank mode, monthly.
// Pastor & Stambaugh 2003 liquidity beta, proxied with the Amihud illiquidity ratio (price-volume only).

export const meta = {
  id: "c1022-acad-63",
  name: "Liquidity beta: long stocks whose returns rise most when aggregate illiquidity improves (Pastor-Stambaugh, price-volume proxy)",
  family: "other",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  longShort: false,
  params: { betaMonths: 36, minMonths: 24, topFrac: 0.2 },
};

const monthKey = (sec) => { const d = new Date(sec * 1000); return d.getUTCFullYear() * 12 + d.getUTCMonth(); };

export function rank(universe, t, ctx) {
  const { betaMonths, minMonths, topFrac } = ctx.params;
  const cur = monthKey(t);
  const elig = Object.keys(universe).filter((s) => universe[s].length > 540);
  if (elig.length < 3) return {};
  const startKey = cur - betaMonths - 2;

  // daily Amihud |ret|/(close*volume), averaged across eligible names trading that day; month-end closes
  const dayA = new Map();
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
      const dv = b[k].close * b[k].volume;
      if (!(dv > 0)) continue;
      const a = Math.abs(b[k].close / b[k - 1].close - 1) / dv;
      const e = dayA.get(b[k].time) || { sum: 0, n: 0 };
      e.sum += a;
      e.n++;
      dayA.set(b[k].time, e);
    }
  }

  // monthly aggregate illiquidity L_m = mean of daily cross-sectional means; innovation u_m = -(ln L_m - ln L_m-1)
  const lsum = new Map();
  for (const [time, e] of dayA) {
    const key = monthKey(time);
    const x = lsum.get(key) || { s: 0, c: 0 };
    x.s += e.sum / e.n;
    x.c++;
    lsum.set(key, x);
  }
  const L = (key) => { const x = lsum.get(key); return x && x.c ? x.s / x.c : NaN; };
  const u = new Map();
  for (let m = cur - betaMonths; m < cur; m++) {
    const v = -(Math.log(L(m)) - Math.log(L(m - 1)));
    if (Number.isFinite(v)) u.set(m, v);
  }

  const scores = [];
  for (const sym of elig) {
    const lc = lastClose[sym];
    const xs = [], ys = [];
    for (let m = cur - betaMonths; m < cur; m++) {
      const c1 = lc.get(m), c0 = lc.get(m - 1);
      if (c1 === undefined || c0 === undefined || !u.has(m)) continue;
      ys.push(c1 / c0 - 1);
      xs.push(u.get(m));
    }
    if (ys.length < minMonths) continue;
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
