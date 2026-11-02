// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-30)
export const meta = {
  id: "c1031-etfxs-30",
  name: "Low-volume momentum winners (Lee-Swaminathan): among the top 7 of 13 equity ETFs by 12-1, hold the 4 with the lowest recent volume",
  family: "momentum",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "QQQ", "DIA"],
  rebalance: "monthly",
  longShort: false,
  params: { top: 7, hold: 4, shortWin: 63, longWin: 252 },
};

const meanVol = (b, from, to) => {
  let s = 0;
  for (let k = from; k <= to; k++) s += b[k].volume;
  return s / (to - from + 1);
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const elig = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length > 253) elig.push({ sym, b, e: b.length - 1 });
  }
  if (elig.length < 8) return {};
  for (const s of elig) s.mom = s.b[s.e - 21].close / s.b[s.e - 252].close - 1;
  elig.sort((x, y) => y.mom - x.mom || (x.sym < y.sym ? -1 : 1));
  const top = elig.slice(0, p.top);
  for (const s of top) s.v = meanVol(s.b, s.e - (p.shortWin - 1), s.e) / meanVol(s.b, s.e - (p.longWin - 1), s.e);
  top.sort((x, y) => x.v - y.v || (x.sym < y.sym ? -1 : 1));
  const w = {};
  for (const s of top.slice(0, p.hold)) w[s.sym] = 1 / p.hold;
  return w;
}
