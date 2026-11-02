// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-09). Hosoda 1969, Ichimoku Kumo twist.
export const meta = {
  id: "c1031-retailta-09",
  name: "Ichimoku Kumo twist: long when Senkou A crosses above Senkou B (future cloud turns bullish)",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1d",
  params: { tenkan: 9, kijun: 26, senkouB: 52 },
};

const mid = (ctx, n, j) => {
  const d = ctx.donchian(n, j);
  return (d.upper + d.lower) / 2;
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  if (i < 1) return st.pos;
  const p = ctx.params;
  const A = (j) => (mid(ctx, p.tenkan, j) + mid(ctx, p.kijun, j)) / 2;
  const B = (j) => mid(ctx, p.senkouB, j);
  const a = A(i), b = B(i);
  const crossUp = A(i - 1) <= B(i - 1) && a > b;
  if (st.pos === 1) {
    if (a < b) st.pos = 0;
  } else if (crossUp) {
    st.pos = 1;
  }
  return st.pos;
}
