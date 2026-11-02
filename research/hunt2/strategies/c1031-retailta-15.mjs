// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-15). Stoller, STARC bands.
export const meta = {
  id: "c1031-retailta-15",
  name: "STARC bands (Stoller): buy a close below SMA(6) minus 2 ATR(15), exit at the SMA(6)",
  family: "mean_reversion",
  source: "c1031/retailta",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { sma: 6, atr: 15, mult: 2 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const p = ctx.params;
  const mid = ctx.sma("close", p.sma, i);
  const a = ctx.atr(p.atr, i);
  if (Number.isNaN(mid) || Number.isNaN(a)) return st.pos;
  const c = bars[i].close;
  if (st.pos === 1) {
    if (c > mid) st.pos = 0;
  } else if (c < mid - p.mult * a) {
    st.pos = 1;
  }
  return st.pos;
}
