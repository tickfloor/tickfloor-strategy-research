// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-10). Hosoda 1969 / Elliott 2007, Kijun-sen cross.
export const meta = {
  id: "c1031-retailta-10",
  name: "Kijun-sen cross: long when the close crosses above the 26-bar midpoint line",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "etf",
  timeframe: "1d",
  params: { kijun: 26 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  if (i === 0) return 0;
  const kijun = (j) => {
    const d = ctx.donchian(ctx.params.kijun, j);
    return (d.upper + d.lower) / 2;
  };
  const k = kijun(i);
  const kPrev = kijun(i - 1);
  const enter = bars[i - 1].close <= kPrev && bars[i].close > k;
  const exit = bars[i].close < k;
  if (st.pos === 0) { if (enter) st.pos = 1; }
  else if (exit) st.pos = 0;
  return st.pos;
}
