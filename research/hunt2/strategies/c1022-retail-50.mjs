// c1022 retail spec 50 (campaign-1022/prereg-retail.json, frozen before code).
// Piercing line after a 5-bar decline. Exit level = low[i] fixed at entry.
export const meta = {
  id: "c1022-retail-50",
  name: "Piercing line after a 5-day decline",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { declineBars: 5, maxHold: 10 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.stop = NaN; }
  if (i < p.declineBars + 1) return 0;

  if (st.pos === 1) {
    st.held++;
    if (b[i].close < st.stop || st.held >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  const prev = b[i - 1];
  const cond =
    prev.close < prev.open &&
    b[i - 1 - p.declineBars].close > prev.close &&
    b[i].open < prev.low &&
    b[i].close > (prev.open + prev.close) / 2 &&
    b[i].close < prev.open;
  if (cond) { st.pos = 1; st.held = 0; st.stop = b[i].low; }
  return st.pos;
}
