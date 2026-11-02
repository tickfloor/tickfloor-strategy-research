// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-27)
export const meta = {
  id: "c1031-etfxs-27",
  name: "Chaikin money-flow accumulation rank: 4 of 13 equity ETFs with the highest 63-day CMF above their 100-day SMA, monthly",
  family: "trend",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "QQQ", "DIA"],
  rebalance: "monthly",
  longShort: false,
  params: { cmfWindow: 63, sma: 100, top: 4 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length > 101) elig.push({ sym, b, e: b.length - 1 });
  }
  if (elig.length < 8) return {};
  const cands = [];
  for (const s of elig) {
    let num = 0, den = 0;
    for (let k = s.e - (p.cmfWindow - 1); k <= s.e; k++) {
      const bar = s.b[k];
      const hl = bar.high - bar.low;
      const mfm = hl === 0 ? 0 : ((bar.close - bar.low) - (bar.high - bar.close)) / hl;
      num += mfm * bar.volume;
      den += bar.volume;
    }
    s.cmf = num / den;
    let ma = 0;
    for (let k = s.e - (p.sma - 1); k <= s.e; k++) ma += s.b[k].close;
    ma /= p.sma;
    if (s.b[s.e].close > ma) cands.push(s);
  }
  if (cands.length < 2) return {};
  cands.sort((x, y) => y.cmf - x.cmf || (x.sym < y.sym ? -1 : 1));
  const n = Math.min(p.top, cands.length);
  const w = {};
  for (const s of cands.slice(0, n)) w[s.sym] = 1 / n;
  return w;
}
