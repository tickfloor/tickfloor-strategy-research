// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-15). Amaya, Christoffersen, Jacobs & Vasquez 2015, JFE 118(1), 135-167 (crypto transfer)
export const meta = {
  id: "c1024-acad3-15",
  name: "Crypto realized kurtosis: long the 6 coins with the fattest-tailed daily returns over the past 63 days, weekly (Amaya et al. transfer)",
  family: "volatility",
  source: "c1024/acad3",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  params: { window: 63, top: 6 },
};

const mean = (x) => x.reduce((s, v) => s + v, 0) / x.length;
// return at offset d back from the symbol's own last bar e = L-1
const retAt = (b, d) => b[b.length - 1 - d].close / b[b.length - 2 - d].close - 1;

export function rank(universe, t, ctx) {
  const { window: W, top } = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= W + 1) continue; // eligible if L > 64
    const r = [];
    for (let d = 0; d < W; d++) r.push(retAt(b, d));
    const mu = mean(r);
    const m2 = mean(r.map((x) => (x - mu) ** 2));
    if (!(m2 > 0)) continue;
    const m4 = mean(r.map((x) => (x - mu) ** 4));
    scored.push({ sym, kurt: m4 / (m2 * m2) });
  }
  const k = Math.min(top, scored.length);
  if (k < 3) return {};
  scored.sort((a, b) => b.kurt - a.kurt || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const s of scored.slice(0, k)) w[s.sym] = 1 / top; // 1/6 each per spec
  return w;
}
