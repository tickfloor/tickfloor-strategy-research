// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-19). Volatility-contraction momentum: positive 126-day return, then lowest 21d/126d volatility ratio.
export const meta = {
  id: "c1031-etfxs-19",
  name: "Volatility-contraction momentum: among sectors with positive 126-day return, hold the 4 with the lowest 21d/126d volatility ratio",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "QQQ", "DIA"],
  rebalance: "weekly",
  params: { shortVol: 21, longVol: 126, top: 4 },
};

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sampleSd = (a) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  let eligible = 0;
  const cands = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= 127) continue;
    eligible++;
    const e = b.length - 1;
    if (!(b[e].close / b[e - 126].close - 1 > 0)) continue;
    const r = [];
    for (let k = e - p.longVol + 1; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
    cands.push([s, sampleSd(r.slice(r.length - p.shortVol)) / sampleSd(r)]);
  }
  if (eligible < 8 || cands.length < 2) return {};
  cands.sort((x, y) => x[1] - y[1] || (x[0] < y[0] ? -1 : 1));
  const held = cands.slice(0, p.top);
  const w = {};
  for (const [s] of held) w[s] = 1 / held.length;
  return w;
}
