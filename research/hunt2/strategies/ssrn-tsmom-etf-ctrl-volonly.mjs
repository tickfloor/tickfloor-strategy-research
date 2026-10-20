// SSRN run 1 (vol). Portfolio, monthly rebalance at the last close. Long-only (the paper is long/short; known deviation).
// Per asset: s = 1 (no trend sign); sigma = 60-bar realised vol, annualised.
// Raw weight = max(0, s) * (volTarget / sigma) / N, N = assets with enough history that day. If the weights sum above 1, scale to 1 (no leverage); the rest is cash.
export const meta = {
  id: "ssrn-tsmom-etf-ctrl-volonly",
  name: "Control C1: vol-scaled always-long, same weights without the trend sign (ETFs)",
  family: "deep-validation-control",
  source: "Dumb control C1 for run 1 (same vol-scaled weights, no trend sign); prereg research/prereg-2026-10-07-ssrn.md",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "monthly",
  params: { l1: 21, l2: 63, l3: 252, volWin: 60, volTarget: 0.4, ann: 252 },
};

const sg = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);

export function rank(universe, t, ctx) {
  const { l1, l2, l3, volWin, volTarget, ann } = ctx.params;
  const rows = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const n = b.length;
    if (n < l3 + 1) continue;
    const s = 1;
    let m = 0;
    for (let k = n - volWin; k < n; k++) m += b[k].close / b[k - 1].close - 1;
    m /= volWin;
    let v = 0;
    for (let k = n - volWin; k < n; k++) v += (b[k].close / b[k - 1].close - 1 - m) ** 2;
    const sigma = Math.sqrt(v / (volWin - 1)) * Math.sqrt(ann);
    if (!(sigma > 0) || !Number.isFinite(s)) continue;
    rows.push([sym, s, sigma]);
  }
  const N = rows.length;
  if (N < 2) return {};
  const w = {};
  let gross = 0;
  for (const [sym, s, sigma] of rows) {
    const x = (Math.max(0, s) * (volTarget / sigma)) / N;
    if (x > 0) { w[sym] = x; gross += x; }
  }
  if (gross > 1) for (const sym of Object.keys(w)) w[sym] /= gross;
  return w;
}
