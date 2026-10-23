// c1024 round-3 spec c1024-r3-06 (campaign-1024/prereg-r3.json, frozen before code).
// Low-BTC-correlation picks sized proportional to (1 - correlation): a continuous tilt, no cut. Monthly, long-only.
export const meta = {
  id: "c1024-r3-06__rob2",
  name: "Low-BTC-correlation picks sized proportional to (1 - correlation), monthly (continuous tilt) (+25%)",
  family: "equity-factors",
  source: "c1024/r3",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 113, need: 115, minNames: 8 },
};

const ret = (b, k) => b[k].close / b[k - 1].close - 1;

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
    const e = b.length - 1;
    const rs = [];
    for (let k = e - window + 1; k <= e; k++) rs.push(ret(b, k));
    const corr = sym === "BTCUSDT" ? 1 : pearson(rs, rB);
    if (Number.isFinite(corr)) rows.push([sym, Math.max(0, 1 - corr)]);
  }
  const n = rows.length;
  if (n < minNames) return ew(universe);

  const Z = rows.reduce((a, r) => a + r[1], 0);
  if (Z <= 0) return ew(universe);
  const out = {};
  for (const [sym, raw] of rows) out[sym] = raw / Z;
  return out;
}
