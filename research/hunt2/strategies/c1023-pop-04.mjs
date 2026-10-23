// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-04). Connors & Alvarez, Short Term Trading Strategies That Work (2008), 'The 2-period RSI'.
export const meta = {
  id: "c1023-pop-04",
  name: "Connors RSI(2) < 10 above the 200 EMA on hourly crypto, exit RSI(2) > 65",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "crypto",
  timeframe: "1h",
  params: { rsi: 2, entry: 10, exit: 65, ema: 200, maxBars: 24 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.age = 0; }
  const r = ctx.rsi(p.rsi, i);
  const e = ctx.ema("close", p.ema, i);
  let next = 0;
  if (st.pos === 1) {
    st.age += 1;
    next = r > p.exit || st.age >= p.maxBars ? 0 : 1;
  } else if (bars[i].close > e && r < p.entry) {
    next = 1;
    st.age = 0;
  }
  st.pos = next;
  return next;
}
