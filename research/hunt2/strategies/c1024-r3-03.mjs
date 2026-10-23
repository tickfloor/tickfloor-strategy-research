// c1024 round-3 spec c1024-r3-03 (campaign-1024/prereg-r3.json, frozen before code).
// Survivorship test: r2-05 rule (low BTC-correlation, 70th-percentile hold buffer, equal weight) on the 14 frozen discovery coins listed before 2020-01-01.
export const meta = {
  id: "c1024-r3-03",
  name: "Survivorship test: c1023-r2-05's low-correlation sleeve with hold buffer on the 14 discovery coins listed on Binance before 2020-01-01 (list frozen here), monthly",
  family: "equity-factors",
  source: "c1024/r3",
  assetClass: "crypto",
  timeframe: "1d",
  assets: [
    "BTCUSDT", "BNBUSDT", "XRPUSDT", "LTCUSDT", "TRXUSDT", "LINKUSDT", "BCHUSDT",
    "ADAUSDT", "ETCUSDT", "ATOMUSDT", "ZECUSDT", "DASHUSDT", "DOGEUSDT", "HBARUSDT",
  ],
  rebalance: "monthly",
  params: {
    window: 90,
    need: 92,
    minNames: 8,
    holdPct: 0.7,
    selectPct: 0.5,
    frozenList: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "LTCUSDT", "TRXUSDT", "LINKUSDT", "BCHUSDT", "ADAUSDT", "ETCUSDT", "ATOMUSDT", "ZECUSDT", "DASHUSDT", "DOGEUSDT", "HBARUSDT"],
    excluded: ["AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT"],
  },
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
    if (Number.isFinite(corr)) rows.push([sym, corr]);
  }
  const n = rows.length;
  if (n < minNames) {
    ctx.state.H = [];
    return ew(universe);
  }

  rows.sort((x, y) => x[1] - y[1] || cmp(x[0], y[0]));
  const pos = new Map();
  rows.forEach(([sym], idx) => pos.set(sym, idx));
  const pct = (sym) => pos.get(sym) / (n - 1);

  const H = ctx.state.H.filter((s) => pos.has(s) && pct(s) <= holdPct);
  const target = Math.ceil(selectPct * n);
  for (const [sym] of rows) {
    if (H.length >= target) break;
    if (!H.includes(sym)) H.push(sym);
  }
  ctx.state.H = H;

  const out = {};
  for (const s of H) out[s] = 1 / H.length;
  return out;
}
