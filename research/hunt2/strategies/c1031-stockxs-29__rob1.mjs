// Spec: research/hunt2/campaign-1031/prereg-stockxs.json (c1031-stockxs-29). Count of 20-day closing highs over 126 days, top 8, monthly.
export const meta = {
  id: "c1031-stockxs-29__rob1",
  name: "New-high frequency: the 8 large caps with the most 20-day closing highs in the past 6 months, monthly (-25%)",
  family: "trend",
  source: "c1031/stockxs",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_DAILY",
  rebalance: "monthly",
  longShort: false,
  params: { window: 95, lookback: 20, top: 8 },
};

const pos = (b, lo, hi) => { for (let k = lo; k <= hi; k++) { const x = b[k]; if (!(x.open > 0 && x.high > 0 && x.low > 0 && x.close > 0)) return false; } return true; };
const byName = (x, y) => (x.sym < y.sym ? -1 : x.sym > y.sym ? 1 : 0);

export function rank(universe, t, ctx) {
  const { window: W, lookback: N, top } = ctx.params;
  const names = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const e = b.length - 1;
    if (e < W + N || !pos(b, e - W - N + 1, e)) continue;
    let hh = 0;
    for (let k = e - W + 1; k <= e; k++) {
      let mx = -Infinity;
      for (let j = k - N; j <= k - 1; j++) if (b[j].close > mx) mx = b[j].close;
      if (b[k].close > mx) hh++;
    }
    names.push({ sym, hh, r: b[e].close / b[e - W].close - 1 });
  }
  if (names.length < top) return {};
  names.sort((x, y) => y.hh - x.hh || y.r - x.r || byName(x, y));
  const w = {};
  for (const p of names.slice(0, top)) w[p.sym] = 1 / top;
  return w;
}
