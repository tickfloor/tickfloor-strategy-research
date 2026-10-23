// c1022 retail spec 40 (campaign-1022/prereg-retail.json, frozen before code).
// Ripster EMA clouds: fast cloud EMA5/EMA12, slow cloud EMA34/EMA50.
export const meta = {
  id: "c1022-retail-40",
  name: "Ripster EMA clouds (5/12 over 34/50) stacked long",
  family: "trend",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { fastCloud: [5, 12], slowCloud: [34, 50] },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const [f1, f2] = p.fastCloud, [s1, s2] = p.slowCloud;
  const e5 = ctx.ema("close", f1, i), e12 = ctx.ema("close", f2, i);
  const e34 = ctx.ema("close", s1, i), e50 = ctx.ema("close", s2, i);
  if (![e5, e12, e34, e50].every(Number.isFinite)) return st.pos;
  const c = bars[i].close;

  if (st.pos === 0) {
    if (e5 > e12 && e34 > e50 && Math.min(e5, e12) > Math.max(e34, e50) && c > e34) st.pos = 1;
  } else if (c < Math.min(e34, e50)) {
    st.pos = 0;
  }
  return st.pos;
}
