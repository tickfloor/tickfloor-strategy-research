// c1031 round-4 spec c1031-r4-15 (campaign-1031/prereg-r4.json, frozen before code).
// Intersection of the top half by 5% VaR and the top half by downside beta (wide US stocks), equal weight. Monthly, long-only.
export const meta = {
  id: "c1031-r4-15",
  name: "Intersection of top-half value-at-risk and top-half downside beta, equal weight (wide US stocks), monthly",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 252, minDown: 60, need: 254, minNames: 50, minHoldings: 10, q: 0.05, k: 13, varWindow: 250 },
};

const retAt = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

// rows: [sym, value]; descending, ties by name ascending
function topN(rows, n) {
  return rows
    .slice()
    .sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]))
    .slice(0, n)
    .map((x) => x[0]);
}

function varOf(b, e, window, k) {
  const r = [];
  for (let j = 0; j < window; j++) r.push(retAt(b, e - j));
  r.sort((x, y) => x - y);
  return -r[k - 1];
}

export function rank(universe, t, ctx) {
  const { window, minDown, need, minNames, minHoldings, k, varWindow } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);

  // market = equal-weight mean of eligible returns at offset j (0 = latest bar)
  const m = new Array(window).fill(0);
  for (const s of elig) {
    const b = universe[s], e = b.length - 1;
    for (let j = 0; j < window; j++) m[j] += retAt(b, e - j) / M;
  }
  const down = [];
  for (let j = 0; j < window; j++) if (m[j] < 0) down.push(j);
  if (down.length < minDown) return ew(universe);
  const md = mean(down.map((j) => m[j]));
  const vm = down.reduce((p, j) => p + (m[j] - md) ** 2, 0);
  if (!(vm > 0)) return ew(universe);

  const beta = elig.map((s) => {
    const b = universe[s], e = b.length - 1;
    const r = down.map((j) => retAt(b, e - j));
    const rd = mean(r);
    let c = 0;
    down.forEach((j, idx) => {
      c += (r[idx] - rd) * (m[j] - md);
    });
    return [s, c / vm];
  });
  const va = elig.map((s) => [s, varOf(universe[s], universe[s].length - 1, varWindow, k)]);

  const half = Math.ceil(M / 2);
  const hv = topN(va, half);
  const hb = topN(beta, half);
  const I = hv.filter((s) => hb.includes(s));
  if (I.length < minHoldings) return ew(universe);
  const out = {};
  for (const s of I) out[s] = 1 / I.length;
  return out;
}
