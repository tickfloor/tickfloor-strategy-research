// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-30). Latest volume-spike day, close vs open follow-through, top 8, monthly.
export const meta = {
  id: "c1031-stockxs-30",
  name: "Event-day intraday follow-through: the 8 large caps whose latest volume spike closed furthest above its open, monthly",
  family: "event-driven",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { spike: 2.5, avgWin: 50, minAge: 3, maxAge: 44, top: 8 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);

export function rank(universe, t, ctx) {
  const P = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < 99 || !pos(b, e - P.maxAge - P.avgWin, e)) continue;
    // most recent event only: scan from the newest eligible bar backwards
    let ev = -1;
    for (let k = e - P.minAge; k >= e - P.maxAge; k--) {
      let avg = 0;
      for (let j = k - P.avgWin; j <= k - 1; j++) avg += b[j].volume;
      avg /= P.avgWin;
      if (b[k].volume >= P.spike * avg) { ev = k; break; }
    }
    if (ev < 0) continue;
    const s = (b[ev].close - b[ev].open) / b[ev].open;
    if (s > 0) names.push({ sym, s });
  }
  if (names.length < 3) return {};
  names.sort((x, y) => y.s - x.s || byName(x, y));
  const w = {};
  for (const p of names.slice(0, P.top)) w[p.sym] = 1 / P.top;
  return w;
}
