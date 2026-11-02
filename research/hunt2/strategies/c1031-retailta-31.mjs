// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-31). Wilder 1978 ADX filter on an EMA cross.
export const meta = {
  id: "c1031-retailta-31",
  name: "EMA 20/50 cross accepted only when ADX(14) is above 25",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "etf",
  timeframe: "1d",
  params: { fast: 20, slow: 50, adx: 14, adxMin: 25 },
};

export function signal(bars, i, ctx) {
  const pr = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) {
    st.pos = 0; st.k = 0; st.trS = 0; st.pS = 0; st.mS = 0; st.dnCount = 0; st.dxS = 0; st.adx = NaN; st.pf = NaN; st.ps = NaN;
  }

  // Wilder ADX(14): smoothed TR and DM, DX every bar from the 14th, ADX = mean of the first 14 DX, then Wilder.
  if (i > 0) {
    const b = bars[i];
    const pb = bars[i - 1];
    const up = b.high - pb.high;
    const down = pb.low - b.low;
    const pdm = up > down && up > 0 ? up : 0;
    const mdm = down > up && down > 0 ? down : 0;
    const tr = Math.max(b.high - b.low, Math.abs(b.high - pb.close), Math.abs(b.low - pb.close));
    st.k++;
    if (st.k <= pr.adx) { st.trS += tr; st.pS += pdm; st.mS += mdm; }
    else {
      st.trS = st.trS - st.trS / pr.adx + tr;
      st.pS = st.pS - st.pS / pr.adx + pdm;
      st.mS = st.mS - st.mS / pr.adx + mdm;
    }
    if (st.k >= pr.adx) {
      const pdi = st.trS > 0 ? (100 * st.pS) / st.trS : 0;
      const mdi = st.trS > 0 ? (100 * st.mS) / st.trS : 0;
      const dx = pdi + mdi > 0 ? (100 * Math.abs(pdi - mdi)) / (pdi + mdi) : 0;
      if (st.dnCount < pr.adx) {
        st.dxS += dx;
        st.dnCount++;
        if (st.dnCount === pr.adx) st.adx = st.dxS / pr.adx;
      } else st.adx = (st.adx * (pr.adx - 1) + dx) / pr.adx;
    }
  }

  const f = ctx.ema("close", pr.fast, i);
  const s = ctx.ema("close", pr.slow, i);
  const cross = st.pf <= st.ps && f > s;
  const exit = f < s;
  if (st.pos === 0) { if (cross && st.adx > pr.adxMin) st.pos = 1; }
  else if (exit) st.pos = 0;
  st.pf = f;
  st.ps = s;
  return st.pos;
}
