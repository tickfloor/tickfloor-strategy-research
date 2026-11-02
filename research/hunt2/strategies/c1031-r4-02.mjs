// c1031 round-4 spec c1031-r4-02 (campaign-1031/prereg-r4.json, frozen before code).
// Crypto value-at-risk sort, monthly: 5% daily loss over 365 days, hold the top floor(n/3) equal weight. Long-only.
export const meta = {
  id: "c1031-r4-02",
  name: "Crypto value-at-risk sort, faithful port of the stock rule: 5% daily loss over 365 days, top third, monthly",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "monthly",
  params: { window: 365, q: 0.05, k: 19, need: 366, minNames: 12, divisor: 3 },
};

const retAt = (b, k) => b[k].close / b[k - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

// VaR = minus the kth lowest daily return over the window ending at bar e (empirical, no interpolation)
function varOf(b, e, window, k) {
  const r = [];
  for (let j = 0; j < window; j++) r.push(retAt(b, e - j));
  r.sort((x, y) => x - y);
  return -r[k - 1];
}

export function rank(universe, t, ctx) {
  const { window, k, need, minNames, divisor } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const n = elig.length;
  if (n < minNames) return ew(universe);
  const rows = elig.map((s) => [s, varOf(universe[s], universe[s].length - 1, window, k)]);
  rows.sort((a, b) => b[1] - a[1] || cmp(a[0], b[0]));
  const top = rows.slice(0, Math.floor(n / divisor));
  const w = {};
  for (const [s] of top) w[s] = 1 / top.length;
  return w;
}
