// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-08). Larry Williams (1973); StockCharts %R.
export const meta = {
  id: "c1031-retailta-08",
  name: "Williams %R(14) momentum: long on the cross above -20 while the close is above the 50-day SMA",
  family: "momentum",
  source: "c1031/retailta",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  params: { n: 14, enter: -20, exit: -50, trend: 50 },
};

export function signal(bars, i, ctx) {
  const { n, enter, exit, trend } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const d = ctx.donchian(n, i);
  const hh = d.upper, ll = d.lower;
  const c = bars[i].close;
  const r = hh === ll ? NaN : -100 * (hh - c) / (hh - ll);
  const rPrev = st.r;
  st.r = r;
  const sma = ctx.sma("close", trend, i);
  if (st.pos === 1) {
    if (r < exit) st.pos = 0;
  } else if (rPrev <= enter && r > enter && c > sma) {
    st.pos = 1;
  }
  return st.pos;
}
