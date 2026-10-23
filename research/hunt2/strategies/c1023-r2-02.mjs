// c1023 round-2 spec r2-02 (campaign-1023/prereg-r2.json, frozen before code).
// Low-BTC-correlation rank sleeve only when the EW alt index is below its 200-day SMA; plain BTC otherwise. Monthly, long-only.
export const meta = {
  id: "c1023-r2-02",
  name: "Low BTC-correlation sleeve only while the EW alt index is below its 200-day SMA, BTC otherwise",
  family: "equity-factors",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 90, need: 92, minNames: 8, smaDays: 200, idxNeed: 202 },
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

export function rank(universe, t, ctx) {
  const { window, need, minNames, smaDays, idxNeed } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return ew(universe);

  const alts = Object.keys(universe).filter((s) => s !== "BTCUSDT" && universe[s].length >= idxNeed);
  if (alts.length < 4) return ew(universe);

  // EW alt index level over the last smaDays bars, aligned from each series' end (age 0 = latest bar)
  const levels = [];
  let level = 1;
  for (let a = smaDays - 1; a >= 0; a--) {
    let m = 0;
    for (const s of alts) {
      const b = universe[s];
      m += ret(b, b.length - 1 - a);
    }
    m /= alts.length;
    level *= 1 + m;
    levels.push(level);
  }
  const lvNow = levels[levels.length - 1];
  const sma = levels.reduce((x, y) => x + y, 0) / levels.length;
  const riskOff = lvNow < sma;
  if (!riskOff) return { BTCUSDT: 1 };

  const eB = btc.length - 1;
  const rB = [];
  for (let k = eB - window + 1; k <= eB; k++) rB.push(ret(btc, k));
  const rows = [["BTCUSDT", 1]];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (sym === "BTCUSDT" || b.length < need) continue;
    const e = b.length - 1;
    const rs = [];
    for (let k = e - window + 1; k <= e; k++) rs.push(ret(b, k));
    const c = pearson(rs, rB);
    if (Number.isFinite(c)) rows.push([sym, c]);
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
