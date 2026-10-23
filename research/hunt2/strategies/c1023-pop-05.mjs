// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-05). William O'Neil, How to Make Money in Stocks (2009), ch. 10-11 (7% sell rule).
export const meta = {
  id: "c1023-pop-05",
  name: "O'Neil sell rules: 52-week-high breakout on volume with a 7% stop and a 20% profit target",
  family: "trend",
  source: "c1023/pop",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { high: 250, volMult: 1.5, volSma: 50, stopPct: 0.07, targetPct: 0.2, maxBars: 120 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entry = NaN; st.at = 0; }
  const c = bars[i].close;
  let next = 0;
  if (st.pos === 1) {
    const exit = c <= st.entry * (1 - p.stopPct) || c >= st.entry * (1 + p.targetPct) || i - st.at >= p.maxBars;
    next = exit ? 0 : 1;
  } else if (i >= p.high) {
    let hi = -Infinity;
    for (let k = i - p.high; k <= i - 1; k++) if (bars[k].close > hi) hi = bars[k].close;
    const volAvg = ctx.sma("volume", p.volSma, i - 1);
    if (c > hi && bars[i].volume > p.volMult * volAvg) {
      next = 1;
      st.entry = c;
      st.at = i;
    }
  }
  st.pos = next;
  return next;
}
