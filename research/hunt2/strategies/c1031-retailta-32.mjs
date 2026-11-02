// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-32). Lien (2008), Double Bollinger Bands.
export const meta = {
  id: "c1031-retailta-32",
  name: "Double Bollinger Bands (Lien): buy a close entering the +1 to +2 sigma buy zone, exit at the mean",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: { n: 20, inner: 1, outer: 2 },
};

export function signal(bars, i, ctx) {
  const { n, inner, outer } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const band = (k, mult) => ctx.sma("close", n, k) + mult * ctx.rollingStd("close", n, k);
  const m = ctx.sma("close", n, i);
  if (st.pos === 1) {
    if (bars[i].close < m) st.pos = 0;
    return st.pos;
  }
  if (i < 1) return 0;
  const c = bars[i].close, cPrev = bars[i - 1].close;
  const upIn = band(i, inner), upOut = band(i, outer), upInPrev = band(i - 1, inner);
  if (!Number.isFinite(upIn) || !Number.isFinite(upOut) || !Number.isFinite(upInPrev)) return 0;
  if (c > upIn && c <= upOut && cPrev <= upInPrev) st.pos = 1;
  return st.pos;
}
