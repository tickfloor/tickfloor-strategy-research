// c1031 round-4 spec c1031-r4-22 (campaign-1031/prereg-r4.json, frozen before code).
// Intersection of top-half 12-1 momentum and top-half 5% VaR, equal weight, minimum 10 names else EW. Monthly, long-only.
export const meta = {
  id: "c1031-r4-22__rob1",
  name: "Intersection of top-half 12-1 momentum and top-half value-at-risk, equal weight (wide US stocks), monthly (-25%)",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { form: 189, skip: 21, varWindow: 250, q: 0.05, k: 13, need: 252, minNames: 50, minHoldings: 10 },
};

const ret = (b, j) => b[j].close / b[j - 1].close - 1;
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

// 5% empirical VaR: minus the k-th lowest of the win daily returns ending at bar e
function varOf(b, e, win, k) {
  const r = [];
  for (let j = 0; j < win; j++) r.push(ret(b, e - j));
  r.sort((x, y) => x - y);
  return -r[k - 1];
}

const sortDesc = (names, val) => names.slice().sort((x, y) => val.get(y) - val.get(x) || cmp(x, y));

export function rank(universe, t, ctx) {
  const { form, skip, varWindow, k, need, minNames, minHoldings } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) return ew(universe);
  const E = new Map(elig.map((s) => [s, universe[s].length - 1]));

  const mom = new Map();
  const va = new Map();
  for (const s of elig) {
    const b = universe[s];
    const e = E.get(s);
    mom.set(s, b[e - skip].close / b[e - form].close - 1);
    va.set(s, varOf(b, e, varWindow, k));
  }

  const half = Math.ceil(M / 2);
  const Hm = sortDesc(elig, mom).slice(0, half);
  const Hv = sortDesc(elig, va).slice(0, half);
  const I = Hm.filter((s) => Hv.includes(s));
  if (I.length < minHoldings) return ew(universe);

  const out = {};
  for (const s of I) out[s] = 1 / I.length;
  return out;
}
