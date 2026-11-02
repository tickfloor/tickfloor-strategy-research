// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-25). Price-action inside-bar; Crabel (1990) compression.
export const meta = {
  id: "c1031-retailta-25",
  name: "Inside week breakout: close above the high of a completed inside week, exit on a break of its low",
  family: "chart-structure",
  source: "c1031/retailta",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  params: { tf: "1w", maxHold: 5 },
};

export function signal(bars, i, ctx) {
  const { tf, maxHold } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.held = 0; st.lowW = NaN; }
  const c = bars[i].close;
  if (st.pos === 1) {
    st.held++;
    if (c < st.lowW || st.held >= maxHold) st.pos = 0;
    return st.pos;
  }
  const wk = ctx.resample(bars, tf);
  const last = wk.length - 1;
  // the setup needs the incomplete current week (last) and the last complete week before it (last-1, w) and its predecessor (last-2, p)
  if (last < 2 || wk[last].complete) return 0;
  const w = wk[last - 1], p = wk[last - 2];
  if (!w.complete) return 0;
  const inside = w.high <= p.high && w.low >= p.low;
  if (inside && c > w.high) {
    st.pos = 1;
    st.held = 0;
    st.lowW = w.low;
  }
  return st.pos;
}
