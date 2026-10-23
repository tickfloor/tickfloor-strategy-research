// c1022 retail spec 49 (campaign-1022/prereg-retail.json, frozen before code).
// Tweezer bottom at a 20-bar low. Exit level = min(low[i], low[i-1]) fixed at entry.
export const meta = {
  id: "c1022-retail-49",
  name: "Tweezer bottom at a 20-day low",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  params: { lowTol: 0.001, lookback: 20, maxHold: 10 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state, b = bars;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.stop = NaN; }
  if (i < 1) return 0;

  if (st.pos === 1) {
    st.held++;
    if (b[i].close < st.stop || st.held >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (i < p.lookback + 2) return 0;

  let mn = Infinity;
  for (let k = i - p.lookback; k <= i - 2; k++) if (b[k].low < mn) mn = b[k].low;
  const pairLow = Math.min(b[i].low, b[i - 1].low);
  const bearPrev = b[i - 1].close < b[i - 1].open;
  const bullNow = b[i].close > b[i].open;
  const matchLows = Math.abs(b[i].low - b[i - 1].low) / b[i].low <= p.lowTol;

  if (bearPrev && bullNow && matchLows && pairLow <= mn) {
    st.pos = 1; st.held = 0; st.stop = pairLow;
  }
  return st.pos;
}
