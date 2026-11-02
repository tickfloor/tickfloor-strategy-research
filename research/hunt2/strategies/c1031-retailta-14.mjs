// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-14). Keltner (1960) channel; band re-entry.
export const meta = {
  id: "c1031-retailta-14",
  name: "Keltner channel lower-band reversal: re-entry through the lower band after a close below it",
  family: "mean_reversion",
  source: "c1031/retailta",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: { ema: 20, atr: 10, mult: 2, maxHold: 10 },
};

export function signal(bars, i, ctx) {
  const { ema: emaN, atr: atrN, mult, maxHold } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; }
  const lowerAt = (k) => ctx.ema("close", emaN, k) - mult * ctx.atr(atrN, k);
  const mid = ctx.ema("close", emaN, i);
  if (st.pos === 1) {
    st.held++;
    if (bars[i].close >= mid || st.held >= maxHold) st.pos = 0;
    return st.pos;
  }
  if (i < 1) return 0;
  const lowPrev = lowerAt(i - 1);
  const lowNow = lowerAt(i);
  if (!Number.isFinite(lowPrev) || !Number.isFinite(lowNow)) return 0;
  const c = bars[i].close;
  if (bars[i - 1].close < lowPrev && c >= lowNow && c > bars[i].open) {
    st.pos = 1;
    st.held = 0;
  }
  return st.pos;
}
