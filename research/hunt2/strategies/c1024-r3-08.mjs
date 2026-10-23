// c1024 round-3 spec c1024-r3-08 (campaign-1024/prereg-r3.json, frozen before code).
// r2-09 leg (b): fear = rank-weighted low-BTC-correlation sleeve, greed/neutral/null = equal weight of eligible. Weekly, long-only.
export const meta = {
  id: "c1024-r3-08",
  name: "r2-09 leg (b): rank-weighted low-BTC-correlation sleeve in fear, equal weight in greed and neutral, weekly",
  family: "sentiment",
  source: "c1024/r3",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { greed: 60, fear: 40, lookback: 14, window: 90, need: 92, minNames: 8 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ewOver(names) {
  const w = {};
  for (const s of names) w[s] = 1 / names.length;
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
  const { greed, fear, lookback, window, need, minNames } = ctx.params;
  const g = ctx.macro("FNG");

  if (g != null && g <= fear) {
    const btc = universe.BTCUSDT;
    if (!btc || btc.length < need) return ewOver(Object.keys(universe));
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
    if (n < minNames) return ewOver(Object.keys(universe));
    // descending by corr (position 1 = highest corr); weight of position q = q / T, T = n(n+1)/2
    rows.sort((x, y) => y[1] - x[1] || cmp(x[0], y[0]));
    const T = (n * (n + 1)) / 2;
    const out = {};
    rows.forEach(([sym], idx) => {
      out[sym] = (idx + 1) / T;
    });
    return out;
  }

  // greed, neutral or null: equal weight over eligible (L >= lookback + 1)
  const eligible = [];
  for (const sym of Object.keys(universe)) {
    if (universe[sym].length >= lookback + 1) eligible.push(sym);
  }
  return ewOver(eligible);
}
