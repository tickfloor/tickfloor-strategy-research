// c1031 round-4 spec c1031-r4-20 (campaign-1031/prereg-r4.json, chunk 3, frozen before code).
// Downside-beta top 20% with a hold buffer (keep while within the top 40%), wide US stocks, equal weight. Monthly, long-only.
export const meta = {
  id: "c1031-r4-20__rob2",
  name: "Downside beta top quintile with a hold buffer (keep while within the top 40%), wide US stocks, monthly (+25%)",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 315, minDown: 60, need: 317, minNames: 50, fraction: 0.2, minHoldings: 10, holdFrac: 0.4 },
};

const mean = (xs) => xs.reduce((p, q) => p + q, 0) / xs.length;
const retAt = (b, k) => b[k].close / b[k - 1].close - 1;

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

// rows: [sym, value]; ties broken by symbol name ascending
function sortRows(rows, desc) {
  return [...rows].sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}

// Downside beta (r25-downside-beta-high). Returns [sym, beta] rows, or null when degenerate.
function downBeta(universe, syms, window, minDown) {
  const m = new Array(window).fill(0);
  for (const s of syms) {
    const b = universe[s], e = b.length - 1;
    for (let j = 0; j < window; j++) m[j] += retAt(b, e - j) / syms.length;
  }
  const down = [];
  for (let j = 0; j < window; j++) if (m[j] < 0) down.push(j);
  if (down.length < minDown) return null;
  const md = mean(down.map((j) => m[j]));
  const vm = down.reduce((p, j) => p + (m[j] - md) ** 2, 0);
  if (!(vm > 0)) return null;
  return syms.map((s) => {
    const b = universe[s], e = b.length - 1;
    const rd = mean(down.map((j) => retAt(b, e - j)));
    let c = 0;
    for (const j of down) c += (retAt(b, e - j) - rd) * (m[j] - md);
    return [s, c / vm];
  });
}

export function rank(universe, t, ctx) {
  const { window, minDown, need, minNames, fraction, minHoldings, holdFrac } = ctx.params;
  if (ctx.state.H === undefined) ctx.state.H = [];
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) {
    ctx.state.H = [];
    return ew(universe);
  }
  const beta = downBeta(universe, elig, window, minDown);
  if (!beta) return ew(universe);

  const sorted = sortRows(beta, true);
  const pos = new Map(sorted.map((r, i) => [r[0], i + 1]));
    const cut = Math.ceil(holdFrac * M);
  const H = ctx.state.H.filter((s) => pos.has(s) && pos.get(s) <= cut);
  const N = Math.max(minHoldings, Math.round(fraction * M));
  for (const [s] of sorted) {
    if (H.length >= N) break;
    if (!H.includes(s)) H.push(s);
  }
  ctx.state.H = H;

  const out = {};
  for (const s of H) out[s] = 1 / H.length;
  return out;
}
