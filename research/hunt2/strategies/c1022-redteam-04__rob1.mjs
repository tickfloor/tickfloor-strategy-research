// c1022 red-team spec 04 (campaign-1022/prereg-redteam.json, frozen before code).
// Frazzini & Pedersen 2014 JFE section 3; Blitz, van Vliet & Baltussen 2020.
// Low correlation with BTC (not beta): rank-weighted, monthly, long-only.
export const meta = {
  id: "c1022-redteam-04__rob1",
  name: "Low correlation with BTC only (beta with the volatility ratio stripped out), rank-weighted (-25%)",
  family: "equity-factors",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 68, need: 70, minNames: 8 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

const ret = (b, k) => b[k].close / b[k - 1].close - 1;

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
  const { window, need, minNames } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return ew(universe);

  const eB = btc.length - 1;
  const rB = [];
  for (let k = eB - window + 1; k <= eB; k++) rB.push(ret(btc, k));

  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < need) continue;
    if (sym === "BTCUSDT") {
      rows.push([sym, 1]);
      continue;
    }
    const e = b.length - 1;
    const rs = [];
    for (let k = e - window + 1; k <= e; k++) rs.push(ret(b, k));
    const c = pearson(rs, rB);
    if (Number.isFinite(c)) rows.push([sym, c]);
  }
  if (rows.length < minNames) return ew(universe);

  // highest correlation = position 1 = smallest weight; lowest correlation gets the largest weight
  rows.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0));
  const n = rows.length;
  const sumQ = (n * (n + 1)) / 2;
  const out = {};
  rows.forEach(([sym], idx) => {
    out[sym] = (idx + 1) / sumQ;
  });
  return out;
}
