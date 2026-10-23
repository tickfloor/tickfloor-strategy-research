// c1023 round-2 spec r2-09 (campaign-1023/prereg-r2.json, frozen before code).
// Greed (F&G >= 60): top-4 two-week momentum. Fear (F&G <= 40): low-BTC-correlation rank sleeve. Neutral/null: EW of eligible. Weekly.
export const meta = {
  id: "c1023-r2-09__rob2",
  name: "Two-week momentum in greed, low-BTC-correlation sleeve in fear, weekly (+25%)",
  family: "sentiment",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { greed: 60, fear: 40, lookback: 18, top: 4, window: 90, need: 92, minNames: 8 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

function ewOver(names) {
  const w = {};
  for (const s of names) w[s] = 1 / names.length;
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

export function rank(universe, t, ctx) {
  const { greed, fear, lookback, top, window, need, minNames } = ctx.params;
  const g = ctx.macro("FNG");

  const eligible = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < lookback + 1) continue;
    const e = b.length - 1;
    eligible.push({ sym, score: b[e].close / b[e - lookback].close - 1 });
  }

  if (g != null && g >= greed) {
    eligible.sort((x, y) => y.score - x.score || cmp(x.sym, y.sym));
    const out = {};
    for (const r of eligible.slice(0, top)) out[r.sym] = 1 / top;
    return out;
  }

  if (g != null && g <= fear) {
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
      if (Number.isFinite(corr)) rows.push([sym, corr]);
    }
    if (rows.length < minNames) return ew(universe);
    rows.sort((x, y) => y[1] - x[1] || cmp(x[0], y[0]));
    const n = rows.length;
    const sumQ = (n * (n + 1)) / 2;
    const out = {};
    rows.forEach(([sym], idx) => {
      out[sym] = (idx + 1) / sumQ;
    });
    return out;
  }

  return ewOver(eligible.map((r) => r.sym));
}
