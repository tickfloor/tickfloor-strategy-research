// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-20). Momentum plus low-volatility rank composite, 6 of 25 ETFs held.
export const meta = {
  id: "c1031-etfxs-20",
  name: "Momentum plus low-volatility rank combination: 6 of 25 ETFs with the best sum of 12-1 rank and 252d low-volatility rank",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  params: { top: 6, volWindow: 252 },
};

const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const sampleSd = (a) => {
  const m = mean(a);
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1));
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const mom = {};
  const vol = {};
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= 253) continue;
    const e = b.length - 1;
    mom[s] = b[e - 21].close / b[e - 252].close - 1;
    const r = [];
    for (let k = e - p.volWindow + 1; k <= e; k++) r.push(b[k].close / b[k - 1].close - 1);
    vol[s] = sampleSd(r);
  }
  const syms = Object.keys(mom);
  if (syms.length < 12) return {};
  const rankOf = (key, asc) => {
    const order = syms.slice().sort((x, y) => (asc ? key[x] - key[y] : key[y] - key[x]) || (x < y ? -1 : 1));
    const r = {};
    order.forEach((s, i) => { r[s] = i + 1; });
    return r;
  };
  const rM = rankOf(mom, false);
  const rV = rankOf(vol, true);
  const comp = syms.map((s) => [s, rM[s] + rV[s], rM[s]]);
  comp.sort((x, y) => x[1] - y[1] || x[2] - y[2] || (x[0] < y[0] ? -1 : 1));
  const w = {};
  for (const [s] of comp.slice(0, p.top)) w[s] = 1 / p.top;
  return w;
}
