// Spec: research/hunt2/campaign-1023/prereg-r2.json (c1023-r2-19). Portfolio rank, monthly, long-only.
// Idea: r25-downside-beta-high with the sleeve's volatility matched to the EW elig universe.

export const meta = {
  id: "c1023-r2-19__rob1",
  name: "High downside beta with the sleeve volatility matched to the EW universe, exposure check (wide US stocks), monthly (-25%)",
  family: "equity-factors",
  source: "c1023/r2",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 189, minDown: 60, need: 191, minNames: 50, fraction: 0.2, minHoldings: 10, volWindow: 63 },
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
  const { window, minDown, need, minNames, fraction, minHoldings, volWindow } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const beta = downBeta(universe, elig, window, minDown);
  if (beta === null) return ew(universe);
  const M = elig.length;
  if (M < minNames) return ew(universe);

  const N = Math.max(minHoldings, Math.round(fraction * M));
  const sleeve = topN(elig.map((s) => [s, beta[s]]), N);

  const sleeveRet = (j) => mean(sleeve.map((s) => { const b = universe[s]; return retAt(b, b.length - 1 - j); }));
  const eligRet = (j) => mean(elig.map((s) => { const b = universe[s]; return retAt(b, b.length - 1 - j); }));
  const sS = [], sM = [];
  for (let j = 0; j < volWindow; j++) {
    sS.push(sleeveRet(j));
    sM.push(eligRet(j));
  }
  const sigS = sampleStd(sS), sigM = sampleStd(sM);
  const w = sigS > 0 ? Math.min(1, sigM / sigS) : 1;

  const out = {};
  for (const s of elig) out[s] = (1 - w) / M;
  for (const s of sleeve) out[s] += w / N;
  return out;
}
