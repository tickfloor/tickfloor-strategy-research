// c1022 retail spec 37 (campaign-1022/prereg-retail.json, frozen before code).
// Elder-Ray: bull = high - EMA13, bear = low - EMA13.
export const meta = {
  id: "c1022-retail-37",
  name: "Elder-Ray: bear power rising from below with a rising EMA",
  family: "momentum",
  source: "c1022/retail",
  assetClass: "etf",
  timeframe: "1d",
  params: { ema: 13, maxHold: 20 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; }
  if (i < 1) return 0;
  const e = ctx.ema("close", p.ema, i);
  const ePrev = ctx.ema("close", p.ema, i - 1);
  if (!Number.isFinite(e) || !Number.isFinite(ePrev)) return st.pos;
  const bull = bars[i].high - e;
  const bear = bars[i].low - e;
  const bearPrev = bars[i - 1].low - ePrev;

  if (st.pos === 0) {
    if (e > ePrev && bear < 0 && bear > bearPrev) { st.pos = 1; st.held = 0; }
  } else {
    st.held++;
    if (bull < 0 || e < ePrev || st.held >= p.maxHold) st.pos = 0;
  }
  return st.pos;
}
