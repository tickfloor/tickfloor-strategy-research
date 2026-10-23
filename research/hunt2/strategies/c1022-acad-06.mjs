// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-06). Grinblatt & Han 2005, 'Prospect theory, mental accounting, and momentum', Journal of Financial Economics 78(2), 311-339
export const meta = {
  id: "c1022-acad-06",
  name: "Capital gains overhang: unrealised-gain proxy from a volume-weighted reference price (Grinblatt-Han)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { refBars: 260, decayPerBar: 0.0167, skip: 5, topFrac: 0.2 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const list = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 270) continue;
    let num = 0;
    let den = 0;
    for (let n = 1; n <= p.refBars; n++) {
      const bar = b[L - 1 - n];
      const wt = bar.volume * Math.pow(1 - p.decayPerBar, n);
      num += wt * bar.close;
      den += wt;
    }
    if (!(den > 0)) continue;
    const rp = num / den;
    list.push({ sym, cgo: b[L - 1 - p.skip].close / rp - 1 });
  }
  const E = list.length;
  const k = Math.floor(p.topFrac * E);
  if (k < 3) return {};
  list.sort((a, b) => b.cgo - a.cgo || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of list.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
