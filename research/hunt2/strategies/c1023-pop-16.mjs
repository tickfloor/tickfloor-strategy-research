// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-16). Pradeep Bonde (Stockbee), 'Momentum Burst' / 4% breakout, stockbee.blogspot.com.
export const meta = {
  id: "c1023-pop-16",
  name: "Stockbee 4% momentum burst: 4%+ up day on 1.5x volume, strong close, quiet prior 3 days, 5-day hold",
  family: "momentum",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { movePct: 0.04, volMult: 1.5, volSma: 50, closeLoc: 0.75, quietPct: 0.03, maxBars: 5 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.at = 0; st.entLow = NaN; }
  if (i < 4) return 0;
  const b = bars[i], pr = bars[i - 1], p4 = bars[i - 4];
  let next = st.pos;
  if (st.pos === 1) {
    if (b.close < st.entLow || i - st.at >= p.maxBars) next = 0;
  } else {
    const range = b.high - b.low, prevRange = pr.high - pr.low;
    const burst = b.close / pr.close - 1 >= p.movePct &&
      b.volume >= p.volMult * ctx.sma("volume", p.volSma, i - 1) &&
      b.close >= b.low + p.closeLoc * range &&
      range > prevRange &&
      Math.abs(pr.close / p4.close - 1) <= p.quietPct;
    if (burst) {
      next = 1;
      st.at = i;
      st.entLow = b.low;
    }
  }
  st.pos = next;
  return next;
}
