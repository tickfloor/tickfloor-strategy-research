// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-03). Connors & Alvarez, High Probability ETF Trading (2009), '%b Strategy'.
export const meta = {
  id: "c1023-pop-03",
  name: "Connors %b strategy: Bollinger %b < 0.2 three days running above the 200-day, exit %b > 0.8 (ETFs)",
  family: "mean_reversion",
  source: "c1023/pop",
  assetClass: "etf",
  timeframe: "1d",
  params: { bbLen: 20, bbSd: 2, pbLow: 0.2, pbHigh: 0.8, sma: 200, days: 3 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  if (i < 2) return 0;
  const pb = (k) => {
    const mid = ctx.sma("close", p.bbLen, k);
    const sd = ctx.rollingStd("close", p.bbLen, k);
    const lower = mid - p.bbSd * sd, upper = mid + p.bbSd * sd;
    return (bars[k].close - lower) / (upper - lower);
  };
  let next;
  if (st.pos === 1) {
    next = pb(i) > p.pbHigh ? 0 : 1;
  } else {
    const trend = bars[i].close > ctx.sma("close", p.sma, i);
    next = trend && pb(i) < p.pbLow && pb(i - 1) < p.pbLow && pb(i - 2) < p.pbLow ? 1 : 0;
  }
  st.pos = next;
  return next;
}
