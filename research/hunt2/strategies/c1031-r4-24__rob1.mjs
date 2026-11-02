// c1031 round-4 spec c1031-r4-24 (campaign-1031/prereg-r4.json, frozen before code).
// Intersection of top-half 12-1 momentum and top-half 5% VaR on the 40 large caps, 10-name book cap. Monthly, long-only.
export const meta = {
  id: "c1031-r4-24__rob1",
  name: "Intersection of top-half 12-1 momentum and top-half value-at-risk on the 40 large caps, 10-name book cap, monthly (-25%)",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: { form: 189, skip: 21, varWindow: 250, q: 0.05, k: 13, need: 252, minNames: 20, book: 10, minBook: 5 },
};

const retAt = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

// rows: [sym, value] sorted descending, ties by name ascending
function sortedDesc(rows) {
  return rows.slice().sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]));
}

function varOf(b, e, window, k) {
  const r = [];
  for (let j = 0; j < window; j++) r.push(retAt(b, e - j));
  r.sort((x, y) => x - y);
  return -r[k - 1];
}

export function rank(universe, t, ctx) {
  const { form, skip, varWindow, k, need, minNames, book, minBook } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);

  const mom = elig.map((s) => {
    const b = universe[s], e = b.length - 1;
    return [s, b[e - skip].close / b[e - form].close - 1];
  });
  const va = elig.map((s) => [s, varOf(universe[s], universe[s].length - 1, varWindow, k)]);

  const half = Math.ceil(M / 2);
  const momTop = sortedDesc(mom).slice(0, half).map((x) => x[0]);
  const varTop = sortedDesc(va).slice(0, half).map((x) => x[0]);
  const I = momTop.filter((s) => varTop.includes(s));

  let kept = I;
  if (I.length > book) {
    // rank 1 = highest in each full-universe sort; keep the book names with the smallest rank sum
    const rankOf = (rows) => new Map(sortedDesc(rows).map((r, idx) => [r[0], idx + 1]));
    const rm = rankOf(mom);
    const rv = rankOf(va);
    kept = I.slice()
      .sort((x, y) => rm.get(x) + rv.get(x) - (rm.get(y) + rv.get(y)) || cmp(x, y))
      .slice(0, book);
  }
  if (kept.length < minBook) return ew(universe);
  const out = {};
  for (const s of kept) out[s] = 1 / kept.length;
  return out;
}
