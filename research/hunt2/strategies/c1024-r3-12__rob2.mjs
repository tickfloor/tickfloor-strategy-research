// Spec: research/hunt2/campaign-1024/prereg-r3.json (c1024-r3-12). Portfolio rank, monthly, long-only.
export const meta = {
  id: "c1024-r3-12__rob2",
  name: "High downside beta on the 40 large caps, 10-name book, monthly (+25%)",
  family: "equity-factors",
  source: "c1024/r3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: { window: 315, minDown: 60, need: 317, minNames: 20, book: 10 },
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
  return rows.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
}
const topN = (rows, n) => sortRows(rows, true).slice(0, n).map((x) => x[0]);

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
  const { window, minDown, need, minNames, book } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  if (elig.length < minNames) return ew(universe);
  const beta = downBeta(universe, elig, window, minDown);
  if (!beta) return ew(universe);
  const out = {};
  for (const s of topN(beta, book)) out[s] = 1 / book;
  return out;
}
