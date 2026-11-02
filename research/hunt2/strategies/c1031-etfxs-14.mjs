// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-14). High 5-day volume vs 1-year average volume, top 4 held equally.
export const meta = {
  id: "c1031-etfxs-14",
  name: "High-volume return premium on 13 equity ETFs: hold the 4 with the highest 5-day volume vs their 1-year average",
  family: "other",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "QQQ", "DIA"],
  rebalance: "monthly",
  params: { shortWin: 5, longWin: 252, top: 4 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scored = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= 253) continue;
    const e = b.length - 1;
    let sShort = 0;
    let sLong = 0;
    for (let k = e - p.longWin + 1; k <= e; k++) {
      sLong += b[k].volume;
      if (k > e - p.shortWin) sShort += b[k].volume;
    }
    scored.push([s, (sShort / p.shortWin) / (sLong / p.longWin)]);
  }
  if (scored.length < 8) return {};
  scored.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const w = {};
  for (const [s] of scored.slice(0, p.top)) w[s] = 1 / p.top;
  return w;
}
