// c1031 round-4 spec c1031-r4-21 (campaign-1031/prereg-r4.json, frozen before code).
// Value-at-risk top quintile with a hold buffer (keep while within the top 40%), wide US stocks. Monthly, long-only.
export const meta = {
  id: "c1031-r4-21__rob1",
  name: "Value-at-risk top quintile with a hold buffer (keep while within the top 40%), wide US stocks, monthly (-25%)",
  family: "equity-factors",
  source: "c1031/r4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { varWindow: 188, q: 0.05, k: 10, need: 192, minNames: 50, holdFrac: 0.4, fraction: 0.2 },
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
  const { varWindow, k, need, minNames, holdFrac, fraction } = ctx.params;
  if (ctx.state.H === undefined) ctx.state.H = [];
  const elig = Object.keys(universe).filter((s) => universe[s].length >= need);
  const M = elig.length;
  if (M < minNames) {
    ctx.state.H = [];
    return ew(universe);
  }

  const score = new Map(elig.map((s) => [s, varOf(universe[s], universe[s].length - 1, varWindow, k)]));
  const ranked = elig.slice().sort((x, y) => score.get(y) - score.get(x) || cmp(x, y));
  const pos = new Map(ranked.map((s, idx) => [s, idx + 1])); // 1 = highest VaR

  const N = Math.floor(fraction * M);
  if (N < 3) return {};
  const keepLimit = Math.ceil(holdFrac * M);

  const H = ctx.state.H.filter((s) => pos.has(s) && pos.get(s) <= keepLimit);
  for (const s of ranked) {
    if (H.length >= N) break;
    if (!H.includes(s)) H.push(s);
  }
  ctx.state.H = H;

  const out = {};
  for (const s of H) out[s] = 1 / H.length;
  return out;
}
