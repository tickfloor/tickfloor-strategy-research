// c1031 round-4 spec c1031-r4-17 (campaign-1031/prereg-r4.json, chunk 3, frozen before code).
// Top-half 12-1 momentum intersect top-half downside beta on the 40 large caps, book capped at 10 names by summed rank. Monthly, long-only.
export const meta = {
  id: "c1031-r4-17__rob2",
  name: "Intersection of top-half 12-1 momentum and top-half downside beta on the 40 large caps, 10-name book cap, monthly (+25%)",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: { window: 252, minDown: 60, need: 317, form: 315, skip: 21, minNames: 20, book: 10, minBook: 5 },
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
  const { form, skip, window, minDown, need, minNames, book, minBook } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);
  const beta = downBeta(universe, elig, window, minDown);
  if (!beta) return ew(universe);
  const mom = elig.map((s) => {
    const b = universe[s], e = b.length - 1;
    return [s, b[e - skip].close / b[e - form].close - 1];
  });
  const half = Math.ceil(M / 2);
  const I = topN(mom, half).filter((s) => topN(beta, half).includes(s));
  if (I.length < minBook) return ew(universe);

  let keep = I;
  if (I.length > book) {
    // rank 1 = highest value in each full sort; keep the names with the smallest rank sum
    const rankMom = new Map(sortRows(mom, true).map((r, i) => [r[0], i + 1]));
    const rankBeta = new Map(sortRows(beta, true).map((r, i) => [r[0], i + 1]));
    keep = sortRows(I.map((s) => [s, rankMom.get(s) + rankBeta.get(s)]), false)
      .slice(0, book)
      .map((r) => r[0]);
  }
  const out = {};
  for (const s of keep) out[s] = 1 / keep.length;
  return out;
}
