// c1031 round-4 spec c1031-r4-18 (campaign-1031/prereg-r4.json, frozen before code).
// Value-at-risk premium on the 40 large caps: long the 10 names with the largest 5% daily loss over 250 days. Monthly, long-only.
export const meta = {
  id: "c1031-r4-18__rob2",
  name: "Value-at-risk premium on the 40 large caps: long the 10 names with the largest 5% daily loss over 250 days, monthly (+25%)",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  params: { varWindow: 313, q: 0.05, k: 16, need: 314, minNames: 20, book: 10 },
};

const retAt = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

function varOf(b, e, window, k) {
  const r = [];
  for (let j = 0; j < window; j++) r.push(retAt(b, e - j));
  r.sort((x, y) => x - y);
  return -r[k - 1];
}

export function rank(universe, t, ctx) {
  const { varWindow, k, need, minNames, book } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  if (elig.length < minNames) return ew(universe);
  const rows = elig.map((s) => [s, varOf(universe[s], universe[s].length - 1, varWindow, k)]);
  rows.sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]));
  const out = {};
  for (const [s] of rows.slice(0, book)) out[s] = 1 / book;
  return out;
}
