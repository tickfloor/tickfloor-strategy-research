// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-29). Connors cumulative RSI(2).
export const meta = {
  id: "c1031-retailta-29",
  name: "Cumulative RSI(2) (Connors): two-day RSI(2) sum below 35 above the 200-day SMA",
  family: "mean_reversion",
  source: "c1031/retailta",
  assetClass: "etf",
  timeframe: "1d",
  params: { rsi: 2, cumLen: 2, cumMax: 35, exit: 65, trend: 200 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const p = ctx.params;
  if (i < p.cumLen - 1) return st.pos;
  if (st.pos === 1) {
    if (ctx.rsi(p.rsi, i) > p.exit) st.pos = 0;
  } else {
    let cum = 0;
    for (let k = 0; k < p.cumLen; k++) cum += ctx.rsi(p.rsi, i - k);
    if (cum < p.cumMax && bars[i].close > ctx.sma("close", p.trend, i)) st.pos = 1;
  }
  return st.pos;
}
