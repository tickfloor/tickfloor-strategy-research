// c1022 retail spec 45 (campaign-1022/prereg-retail.json, frozen before code).
// The Strat 2-1-2 bullish reversal. Exit level = inside bar's low, fixed at entry (spec parenthetical).
export const meta = {
  id: "c1022-retail-45",
  name: "The Strat 2-1-2 bullish reversal",
  family: "momentum",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { maxHold: 5 },
};

// Strat bar type vs the previous bar: 1 inside, "2u", "2d", 3 outside
function barType(bars, j) {
  const h = bars[j].high, l = bars[j].low, ph = bars[j - 1].high, pl = bars[j - 1].low;
  if (h <= ph && l >= pl) return 1;
  if (h > ph && l >= pl) return "2u";
  if (l < pl && h <= ph) return "2d";
  return 3;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.stop = NaN; }
  if (i < 3) return 0;

  if (st.pos === 1) {
    st.held++;
    if (bars[i].close < st.stop || barType(bars, i) === "2d" || st.held >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (barType(bars, i - 2) === "2d" && barType(bars, i - 1) === 1 && barType(bars, i) === "2u" && bars[i].close > bars[i].open) {
    st.pos = 1; st.held = 0; st.stop = bars[i - 1].low;
  }
  return st.pos;
}
