// c1031 round-4 spec c1031-r4-14 (campaign-1031/prereg-r4.json, chunk 3, frozen before code).
// Stateless low-BTC-correlation sleeve (lowest half by 90-day correlation, equal weight), held only when Fear & Greed >= greed; cash otherwise. Weekly, long-only.
export const meta = {
  id: "c1031-r4-14__rob1",
  name: "Low-BTC-correlation sleeve in greed only, cash in neutral and fear, weekly (-25%)",
  family: "sentiment",
  source: "c1031/r4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { greed: 60, window: 68, need: 70, minNames: 8, selectPct: 0.5 },
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
  const { greed, window, need, minNames, selectPct } = ctx.params;
  const g = ctx.macro("FNG");
  if (!(g != null && g >= greed)) return {};

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
  const n = rows.length;
  if (n < minNames) return ew(universe);

  rows.sort((x, y) => x[1] - y[1] || cmp(x[0], y[0]));
  const k = Math.ceil(selectPct * n);
  const out = {};
  for (const [sym] of rows.slice(0, k)) out[sym] = 1 / k;
  return out;
}
