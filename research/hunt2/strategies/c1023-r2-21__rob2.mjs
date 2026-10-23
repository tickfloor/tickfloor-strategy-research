// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-21). Portfolio rank, monthly, long-only.
// Idea: r25-downside-beta-high sorted inside the high-volatility half only (acad-61 universe cut).

export const meta = {
  id: "c1023-r2-21__rob2",
  name: "High downside beta sorted inside the high-volatility half only (wide US stocks), monthly (+25%)",
  family: "equity-factors",
  source: "c1023/r2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { volBars: 252, highVolFrac: 0.5, window: 315, minDown: 60, need: 317, minNames: 50, fraction: 0.2, minHoldings: 10 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}
const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
function sampleStd(xs) {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((p, q) => p + (q - m) ** 2, 0) / (xs.length - 1));
}
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
  const { volBars, highVolFrac, window, minDown, need, minNames, fraction, minHoldings } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const beta = downBeta(universe, elig, window, minDown);
  if (beta === null) return ew(universe);
  const M = elig.length;
  if (M < minNames) return ew(universe);

  const vols = elig.map((s) => {
    const b = universe[s], e = b.length - 1, r = [];
    for (let m = 0; m < volBars; m++) r.push(retAt(b, e - m));
    return [s, sampleStd(r)];
  });
  const HV = topN(vols, Math.floor(highVolFrac * M));

  const N = Math.max(minHoldings, Math.round(fraction * M));
  const picks = topN(HV.map((s) => [s, beta[s]]), N);
  const out = {};
  for (const s of picks) out[s] = 1 / N;
  return out;
}
