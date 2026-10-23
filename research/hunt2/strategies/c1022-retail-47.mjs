// c1022 retail spec 47 (campaign-1022/prereg-retail.json, frozen before code).
// Hikkake bullish: inside bar i-1, hikkake bar i; buy the first close above the inside bar's high within 3 bars.
export const meta = {
  id: "c1022-retail-47",
  name: "Hikkake bullish (failed inside-bar breakdown)",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { confirmWindow: 3, maxHold: 10 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.pos === undefined) {
    st.pos = 0; st.held = 0; st.hkLow = NaN; st.setHigh = NaN; st.setLow = NaN; st.setExp = -1;
  }
  if (i < 2) return 0;

  let out = st.pos;
  if (st.pos === 1) {
    st.held++;
    if (b[i].close < st.hkLow || st.held >= p.maxHold) st.pos = 0;
    out = st.pos;
  } else if (st.setExp >= i && b[i].close > st.setHigh) {
    st.pos = 1; st.held = 0; st.hkLow = st.setLow; st.setExp = -1;
    out = 1;
  }

  // new setup: inside bar at i-1 and hikkake bar at i (entries allowed on bars i+1 .. i+confirmWindow)
  const inside = b[i - 1].high <= b[i - 2].high && b[i - 1].low >= b[i - 2].low;
  const hk = b[i].low < b[i - 1].low && b[i].high <= b[i - 1].high;
  if (inside && hk) {
    st.setHigh = b[i - 1].high;
    st.setLow = b[i].low;
    st.setExp = i + p.confirmWindow;
  }
  return out;
}
