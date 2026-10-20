// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-gsr-revert-e",
  name: "Gold/silver ratio reversion: long SLV when GLD/SLV 60d z > 1.5, long GLD when z < -1.5, else cash, daily",
  family: "tests-1010",
  source: "YouTube/Reddit 'gold silver ratio trade' (swap into the cheap metal)",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["GLD", "SLV"],
  rebalance: "daily",
  params: { n: 60, z: 1.5 },
};
export function rank(universe, t, ctx) {
  const g = universe.GLD, s = universe.SLV, n = ctx.params.n;
  if (!g || !s || g.length < n || s.length < n) return {};
  const L = Math.min(g.length, s.length);
  const r = [];
  for (let k = L - n; k < L; k++) r.push(g[g.length - L + k].close / s[s.length - L + k].close);
  const m = r.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(r.reduce((a, b) => a + (b - m) ** 2, 0) / (n - 1));
  if (!(sd > 0)) return {};
  const z = (r[n - 1] - m) / sd;
  if (z > ctx.params.z) return { SLV: 1 };
  if (z < -ctx.params.z) return { GLD: 1 };
  return {};
}
