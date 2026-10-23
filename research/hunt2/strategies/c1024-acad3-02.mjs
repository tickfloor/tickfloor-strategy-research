// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-02). Dittmar 2002, Journal of Finance 57(1), 369-403
export const meta = {
  id: "c1024-acad3-02",
  name: "Cokurtosis premium: long the quintile whose returns co-move most with the cubed market return (Dittmar)",
  family: "volatility",
  source: "c1024/acad3",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { window: 252, topFrac: 0.2 },
};

const mean = (x) => x.reduce((s, v) => s + v, 0) / x.length;
// return at offset d back from the symbol's own last bar e = L-1: ret(b, e-d)
const retAt = (b, d) => b[b.length - 1 - d].close / b[b.length - 2 - d].close - 1;

export function rank(universe, t, ctx) {
  const W = ctx.params.window;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= W + 1) continue; // eligible if L > 253
    const r = [];
    for (let d = 0; d < W; d++) r.push(retAt(b, d));
    names.push({ sym, r });
  }
  const rm = new Array(W).fill(0); // EW market return per offset
  for (const n of names) for (let d = 0; d < W; d++) rm[d] += n.r[d] / names.length;
  const mum = mean(rm);
  const sdm = Math.sqrt(rm.reduce((s, v) => s + (v - mum) ** 2, 0) / (W - 1));
  if (!(sdm > 0)) return {};
  const scored = [];
  for (const n of names) {
    const mu = mean(n.r);
    const sd = Math.sqrt(n.r.reduce((s, v) => s + (v - mu) ** 2, 0) / (W - 1));
    if (!(sd > 0)) continue;
    let c = 0;
    for (let d = 0; d < W; d++) c += (n.r[d] - mu) * (rm[d] - mum) ** 3;
    scored.push({ sym: n.sym, cok: c / W / (sd * sdm ** 3) });
  }
  const k = Math.floor(ctx.params.topFrac * scored.length);
  if (k < 3) return {};
  scored.sort((a, b) => b.cok - a.cok || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const s of scored.slice(0, k)) w[s.sym] = 1 / k;
  return w;
}
