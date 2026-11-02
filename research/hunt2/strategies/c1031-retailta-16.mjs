// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-16). Bollinger 2001, %b confirmed by MFI.
export const meta = {
  id: "c1031-retailta-16",
  name: "Bollinger %b below 0.05 confirmed by MFI(10) below 20 (Bollinger's own indicator pairing)",
  family: "mean_reversion",
  source: "c1031/retailta",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { bb: [20, 2], mfi: 10, pctb: 0.05, mfiMax: 20, exitPctb: 0.5 },
};

export function signal(bars, i, ctx) {
  const pr = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.up = ctx.rolling(pr.mfi); st.dn = ctx.rolling(pr.mfi); st.tp = NaN; }

  // MFI: raw money flow (typical price x volume) summed over up-TP bars vs down-TP bars.
  const b = bars[i];
  const tp = (b.high + b.low + b.close) / 3;
  if (i > 0) {
    const raw = tp * b.volume;
    st.up.push(tp > st.tp ? raw : 0);
    st.dn.push(tp < st.tp ? raw : 0);
  }
  st.tp = tp;
  let mfi = NaN;
  if (st.up.full()) {
    const pos = st.up.sum();
    const neg = st.dn.sum();
    mfi = neg === 0 ? 100 : 100 - 100 / (1 + pos / neg);
  }

  // %b from SMA20 +/- 2 sample std.
  const [n, k] = pr.bb;
  const mid = ctx.sma("close", n, i);
  const sd = ctx.rollingStd("close", n, i);
  const upper = mid + k * sd;
  const lower = mid - k * sd;
  const pctb = upper > lower ? (b.close - lower) / (upper - lower) : NaN;

  const enter = pctb < pr.pctb && mfi < pr.mfiMax;
  const exit = pctb > pr.exitPctb;
  if (st.pos === 0) { if (enter) st.pos = 1; }
  else if (exit) st.pos = 0;
  return st.pos;
}
