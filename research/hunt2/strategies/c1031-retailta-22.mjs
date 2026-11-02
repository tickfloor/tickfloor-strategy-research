// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-22). Shannon (2008), anchored VWAP; Bellafiore, One Good Trade.
export const meta = {
  id: "c1031-retailta-22",
  name: "Anchored VWAP from the latest confirmed swing low: long on the cross above it",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: { L: 10, R: 10 },
};

export function signal(bars, i, ctx) {
  const { L, R } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.anchor = -1; st.cpv = []; st.cv = []; }
  const b = bars[i];
  const tp = (b.high + b.low + b.close) / 3;
  const pvPrev = i ? st.cpv[i - 1] : 0;
  const vPrev = i ? st.cv[i - 1] : 0;
  st.cpv.push(pvPrev + tp * b.volume);
  st.cv.push(vPrev + b.volume);

  // swing low at a = i - R is confirmed on bar i if low[a] is the minimum of low[a-L..a+R]
  const a0 = i - R;
  if (a0 - L >= 0) {
    let isLow = true;
    for (let j = a0 - L; j <= i; j++) {
      if (j !== a0 && bars[j].low < bars[a0].low) { isLow = false; break; }
    }
    if (isLow) st.anchor = a0;
  }
  if (st.anchor < 0 || i < 1) return st.pos;

  const a = st.anchor;
  const avwap = (k) => {
    const dv = st.cv[k] - (a ? st.cv[a - 1] : 0);
    if (!(dv > 0)) return NaN;
    return (st.cpv[k] - (a ? st.cpv[a - 1] : 0)) / dv;
  };
  const vNow = avwap(i);
  const vPrevAvwap = avwap(i - 1);
  if (!Number.isFinite(vNow) || !Number.isFinite(vPrevAvwap)) return st.pos;
  const c = b.close, cPrev = bars[i - 1].close;
  if (st.pos === 1) {
    if (c < vNow) st.pos = 0;
  } else if (cPrev <= vPrevAvwap && c > vNow) {
    st.pos = 1;
  }
  return st.pos;
}
