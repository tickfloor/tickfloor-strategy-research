// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-18). Portfolio rank, monthly, long-only.
// Idea: 50/50 blend of r24b-lo-xsec-momentum-12-1 and r25-downside-beta-high (downside beta construction).

export const meta = {
  id: "c1023-r2-18__rob2",
  name: "12-1 momentum sleeve paired 50/50 with the high-downside-beta sleeve (wide US stocks), monthly (+25%)",
  family: "equity-factors",
  source: "c1023/r2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { form: 315, skip: 21, fraction: 0.2, minHoldings: 10, need: 317, minNames: 50, window: 252, minDown: 60 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const topN = (rows, n) => sortRows(rows, true).slice(0, n).map((x) => x[0]);
const retAt = (b, k) => b[k].close / b[k - 1].close - 1;

// Downside beta on down-market days (r25-downside-beta-high construction, e = L-1).
// Returns {sym: beta} or null when the down set is too small or the market has no variance there.
function downBeta(universe, elig, window, minDown) {
  const rets = elig.map((s) => {
    const b = universe[s], e = b.length - 1, r = [];
    for (let j = 0; j < window; j++) r.push(retAt(b, e - j));
    return [s, r];
  });
  const m = new Array(window).fill(0);
  for (const [, r] of rets) for (let j = 0; j < window; j++) m[j] += r[j] / elig.length;
  const down = [];
  for (let j = 0; j < window; j++) if (m[j] < 0) down.push(j);
  if (down.length < minDown) return null;
  const md = mean(down.map((j) => m[j]));
  const vm = down.reduce((p, j) => p + (m[j] - md) ** 2, 0);
  if (!(vm > 0)) return null;
  const beta = {};
  for (const [s, r] of rets) {
    const rd = mean(down.map((j) => r[j]));
    let c = 0;
    for (const j of down) c += (r[j] - rd) * (m[j] - md);
    beta[s] = c / vm;
  }
  return beta;
}

export function rank(universe, t, ctx) {
  const { form, skip, fraction, minHoldings, need, minNames, window, minDown } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);
  const N = Math.max(minHoldings, Math.round(fraction * M));

  // Sleeve 1: 12-1 momentum, 1/N on the N highest
  const mom = elig.map((s) => {
    const b = universe[s], e = b.length - 1;
    return [s, b[e - skip].close / b[e - form].close - 1];
  });
  const w1 = {};
  for (const s of topN(mom, N)) w1[s] = 1 / N;

  // Sleeve 2: downside beta; if unavailable, equal weight over elig (sleeve 1 unchanged)
  const beta = downBeta(universe, elig, window, minDown);
  const w2 = {};
  if (beta === null) {
    for (const s of elig) w2[s] = 1 / M;
  } else {
    for (const s of topN(elig.map((s) => [s, beta[s]]), N)) w2[s] = 1 / N;
  }

  const out = {};
  for (const s of Object.keys(w1)) out[s] = (out[s] || 0) + 0.5 * w1[s];
  for (const s of Object.keys(w2)) out[s] = (out[s] || 0) + 0.5 * w2[s];
  return out;
}
