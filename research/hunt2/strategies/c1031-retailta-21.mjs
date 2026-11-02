// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-21). Fibonacci weekly pivots, S2 fade.
export const meta = {
  id: "c1031-retailta-21",
  name: "Fibonacci weekly pivot S2 reversion: buy a close at or below P - 0.618*range of last week, sell at P",
  family: "mean_reversion",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1d",
  params: { fib: 0.618, maxHold: 14 },
};

export function signal(bars, i, ctx) {
  const pr = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.nc = 0; st.P = NaN; st.S2 = NaN; }

  // Levels come from the last complete weekly bar: P = (H+L+C)/3, S2 = P - fib*(H-L).
  const W = ctx.resample(bars, "1w");
  while (st.nc < W.length && W[st.nc].complete) st.nc++;
  if (st.nc > 0) {
    const w = W[st.nc - 1];
    st.P = (w.high + w.low + w.close) / 3;
    st.S2 = st.P - pr.fib * (w.high - w.low);
  }

  const c = bars[i].close;
  if (st.pos === 0) {
    if (c <= st.S2) { st.pos = 1; st.held = 0; }
  } else {
    st.held++;
    if (c >= st.P || st.held >= pr.maxHold) st.pos = 0;
  }
  return st.pos;
}
