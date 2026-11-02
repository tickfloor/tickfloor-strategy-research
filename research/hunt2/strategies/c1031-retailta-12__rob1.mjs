// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-12). Smoothed Heikin-Ashi (TradingView scripts; Valcu 2004).
export const meta = {
  id: "c1031-retailta-12__rob1",
  name: "Smoothed Heikin-Ashi: green run on candles built from EMA(6)-smoothed OHLC (-25%)",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1d",
  params: { smooth: 5 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.pos === undefined) {
    st.pos = 0;
    st.haO = NaN;
    st.haC = NaN;
    st.green = false;
  }
  const n = ctx.params.smooth;
  const sO = ctx.ema("open", n, i);
  const sH = ctx.ema("high", n, i);
  const sL = ctx.ema("low", n, i);
  const sC = ctx.ema("close", n, i);
  if (Number.isNaN(sO) || Number.isNaN(sH) || Number.isNaN(sL) || Number.isNaN(sC)) return st.pos;

  const haC = (sO + sH + sL + sC) / 4;
  const haO = Number.isNaN(st.haO) ? (sO + sC) / 2 : (st.haO + st.haC) / 2;
  const green = haC > haO;
  const enter = green && !st.green;
  st.haO = haO;
  st.haC = haC;
  st.green = green;

  if (st.pos === 1) {
    if (haC < haO) st.pos = 0;
  } else if (enter) {
    st.pos = 1;
  }
  return st.pos;
}
