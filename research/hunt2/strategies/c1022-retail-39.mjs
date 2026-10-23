// c1022 retail spec 39 (campaign-1022/prereg-retail.json, frozen before code).
// Vegas tunnel: band = EMA144 / EMA169; trigger = EMA12 re-crossing the top of the band.
export const meta = {
  id: "c1022-retail-39",
  name: "Vegas Tunnel (EMA 144/169) with EMA 12 trigger",
  family: "trend",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1h",
  params: { tunnel: [144, 169], trigger: 12 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  if (i < 1) return 0;
  const [n1, n2] = p.tunnel;
  const t1 = ctx.ema("close", n1, i), t2 = ctx.ema("close", n2, i);
  const t1p = ctx.ema("close", n1, i - 1), t2p = ctx.ema("close", n2, i - 1);
  const f = ctx.ema("close", p.trigger, i), fp = ctx.ema("close", p.trigger, i - 1);
  if (![t1, t2, t1p, t2p, f, fp].every(Number.isFinite)) return st.pos;
  const top = Math.max(t1, t2), bot = Math.min(t1, t2), topPrev = Math.max(t1p, t2p);
  const c = bars[i].close;

  if (st.pos === 0) {
    if (c > top && fp <= topPrev && f > top) st.pos = 1;
  } else if (c < bot) {
    st.pos = 0;
  }
  return st.pos;
}
