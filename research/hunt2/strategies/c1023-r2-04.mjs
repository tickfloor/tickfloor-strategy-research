// c1023 round-2 spec r2-04 (campaign-1023/prereg-r2.json, frozen before code).
// Double sort: bottom-half BTC correlation intersected with top-half 3-week momentum. Monthly, long-only.
export const meta = {
  id: "c1023-r2-04",
  name: "Double sort: bottom-half BTC correlation intersected with top-half 3-week momentum, monthly",
  family: "equity-factors",
  source: "c1023/r2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { corrWindow: 90, momLookback: 21, need: 92, minNames: 8, minHold: 3 },
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
  const { corrWindow, momLookback, need, minNames, minHold } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < need) return ew(universe);

  const eB = btc.length - 1;
  const rB = [];
  for (let k = eB - corrWindow + 1; k <= eB; k++) rB.push(ret(btc, k));

  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < need) continue;
    const e = b.length - 1;
    const rs = [];
    for (let k = e - corrWindow + 1; k <= e; k++) rs.push(ret(b, k));
    const corr = sym === "BTCUSDT" ? 1 : pearson(rs, rB);
    if (!Number.isFinite(corr)) continue;
    rows.push({ sym, corr, mom: b[e].close / b[e - momLookback].close - 1 });
  }
  const n = rows.length;
  if (n < minNames) return ew(universe);

  const byCorr = [...rows].sort((x, y) => x.corr - y.corr || cmp(x.sym, y.sym));
  const LC = new Set(byCorr.slice(0, Math.floor(n / 2)).map((r) => r.sym));
  const byMom = [...rows].sort((x, y) => y.mom - x.mom || cmp(x.sym, y.sym));
  const HM = new Set(byMom.slice(0, Math.ceil(n / 2)).map((r) => r.sym));

  let H = [...LC].filter((s) => HM.has(s));
  if (H.length < minHold) H = [...LC];
  const out = {};
  for (const s of H) out[s] = 1 / H.length;
  return out;
}
