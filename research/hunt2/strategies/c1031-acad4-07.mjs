// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-07). Symmetric 8% swing trend filter (long-only), 25 ETFs
export const meta = {
  id: "c1031-acad4-07",
  name: "Filter rule: 8% swing trend filter, long-only, 25 ETFs",
  family: "trend",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  longShort: false,
  params: { x: 0.08 },
};

export function signal(bars, i, ctx) {
  const st = ctx.state;
  const x = ctx.params.x;
  const c = bars[i].close;
  if (st.ext === undefined) { st.pos = 0; st.ext = c; }
  if (st.pos === 0) {
    st.ext = Math.min(st.ext, c);
    if (c >= st.ext * (1 + x)) { st.pos = 1; st.ext = c; }
  } else {
    st.ext = Math.max(st.ext, c);
    if (c <= st.ext * (1 - x)) { st.pos = 0; st.ext = c; }
  }
  return st.pos;
}
