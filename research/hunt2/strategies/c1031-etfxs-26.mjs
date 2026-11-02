// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-26)
export const meta = {
  id: "c1031-etfxs-26",
  name: "Calmar-ranked ETFs: top 6 of 25 by 252-day return divided by 252-day maximum drawdown, monthly",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  longShort: false,
  params: { window: 252, top: 6, ddFloor: 0.02 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const W = p.window;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length > 253) elig.push({ sym, b, e: b.length - 1 });
  }
  if (elig.length < 12) return {};
  const cands = [];
  for (const s of elig) {
    const start = s.e - W;
    const ret = s.b[s.e].close / s.b[start].close - 1;
    let peak = -Infinity, maxdd = 0;
    for (let k = start + 1; k <= s.e; k++) {
      const c = s.b[k].close;
      if (c > peak) peak = c;
      maxdd = Math.max(maxdd, (peak - c) / peak);
    }
    s.calmar = ret / Math.max(maxdd, p.ddFloor);
    if (s.calmar > 0) cands.push(s);
  }
  if (cands.length < 3) return {};
  cands.sort((x, y) => y.calmar - x.calmar || (x.sym < y.sym ? -1 : 1));
  const n = Math.min(p.top, cands.length);
  const w = {};
  for (const s of cands.slice(0, n)) w[s.sym] = 1 / n;
  return w;
}
