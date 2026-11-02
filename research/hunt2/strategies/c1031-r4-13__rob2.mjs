// c1031 round-4 spec c1031-r4-13 (campaign-1031/prereg-r4.json, frozen before code).
// r3-07 with the greed leg replaced by the stateless low-BTC-correlation sleeve. Greed (FNG >= 60): sleeve. Fear (FNG <= 40): cash. Neutral or null: equal weight of scored names. Weekly, long-only.
export const meta = {
  id: "c1031-r4-13__rob2",
  name: "r3-07 with the greed leg replaced by the low-BTC-correlation sleeve: sleeve in greed, equal weight when neutral, cash in fear, weekly (+25%)",
  family: "sentiment",
  source: "c1031/r4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { greed: 60, fear: 40, window: 113, need: 115, minNames: 8, selectPct: 0.5 },
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

// Lowest-BTC-correlation half, equal weight, no hold buffer.
function lowCorrSleeve(universe, ctx) {
  const { window, need, minNames, selectPct } = ctx.params;
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
    if (Number.isFinite(corr)) rows.push({ sym, corr });
  }
  const n = rows.length;
  if (n < minNames) return ew(universe);

  rows.sort((x, y) => x.corr - y.corr || cmp(x.sym, y.sym));
  return ewOver(rows.slice(0, Math.ceil(selectPct * n)).map((r) => r.sym));
}

export function rank(universe, t, ctx) {
  const { greed, fear, need } = ctx.params;
  const g = ctx.macro("FNG");
  if (g != null && g >= greed) return lowCorrSleeve(universe, ctx);
  if (g != null && g <= fear) return {};
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return ew(universe);
  return ewOver(Object.keys(universe).filter((s) => universe[s].length >= need));
}
