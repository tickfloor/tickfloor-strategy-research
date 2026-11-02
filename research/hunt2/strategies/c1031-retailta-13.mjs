// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-13). Valcu 2004 / StockCharts Heikin-Ashi.
export const meta = {
  id: "c1031-retailta-13",
  name: "Weekly Heikin-Ashi trend: long while the last completed weekly HA candle is green",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "etf",
  timeframe: "1d",
  params: { tf: "1w" },
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.nc = 0; st.haO = NaN; st.haC = NaN; st.green = undefined; }
  // Weekly bars are complete-flagged in order, so walk forward over the newly completed ones only.
  const W = ctx.resample(bars, ctx.params.tf);
  while (st.nc < W.length && W[st.nc].complete) {
    const w = W[st.nc++];
    const haC = (w.open + w.high + w.low + w.close) / 4;
    const haO = st.nc === 1 ? (w.open + w.close) / 2 : (st.haO + st.haC) / 2;
    const green = haC > haO;
    if (!green) st.pos = 0;
    else if (st.green === false) st.pos = 1;
    st.green = green;
    st.haO = haO;
    st.haC = haC;
  }
  return st.pos;
}
