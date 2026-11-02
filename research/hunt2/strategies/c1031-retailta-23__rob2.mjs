// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-23). Wilder extreme point rule (+DI/-DI cross, buy the break of that day's high).
// ADX is in the spec's definition but no ENTER/EXIT condition reads it, so it is not computed.
export const meta = {
  id: "c1031-retailta-23__rob2",
  name: "Wilder extreme point rule: after a +DI/-DI cross buy the break of that day's high (+25%)",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "crypto",
  timeframe: "1d",
  params: { n: 18 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const n = ctx.params.n;
  const b = bars[i];
  if (i === 0) {
    st.ph = b.high;
    st.pl = b.low;
    st.pc = b.close;
    st.sTR = 0;
    st.sP = 0;
    st.sM = 0;
    st.pdi = NaN;
    st.mdi = NaN;
    st.ep = NaN;
    st.pos = 0;
    return 0;
  }
  // Wilder smoothing: first value is the sum of the first n (bars 1..n), then S = S - S/n + x.
  const up = b.high - st.ph;
  const dn = st.pl - b.low;
  const pdm = up > dn && up > 0 ? up : 0;
  const mdm = dn > up && dn > 0 ? dn : 0;
  const tr = Math.max(b.high - b.low, Math.abs(b.high - st.pc), Math.abs(b.low - st.pc));
  st.ph = b.high;
  st.pl = b.low;
  st.pc = b.close;
  if (i <= n) {
    st.sTR += tr;
    st.sP += pdm;
    st.sM += mdm;
  } else {
    st.sTR = st.sTR - st.sTR / n + tr;
    st.sP = st.sP - st.sP / n + pdm;
    st.sM = st.sM - st.sM / n + mdm;
  }
  if (i < n) return st.pos;

  const pdi = (100 * st.sP) / st.sTR;
  const mdi = (100 * st.sM) / st.sTR;
  const pPrev = st.pdi;
  const mPrev = st.mdi;
  st.pdi = pdi;
  st.mdi = mdi;
  const upX = pPrev <= mPrev && pdi > mdi;
  const downX = mPrev <= pPrev && mdi > pdi;

  // A -DI cross above +DI exits and cancels any unfilled EP. NaN EP never satisfies the break.
  if (downX) {
    st.pos = 0;
    st.ep = NaN;
  } else if (st.pos === 0 && b.close > st.ep && pdi > mdi) {
    st.pos = 1;
    st.ep = NaN;
  }
  // The +DI cross sets EP after the entry check, so entry needs a bar after the cross.
  if (upX) st.ep = b.high;
  return st.pos;
}
