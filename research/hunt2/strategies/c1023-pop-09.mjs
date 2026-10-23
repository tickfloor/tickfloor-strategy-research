// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-09). Faber (2007/2013) band discussion; 200-day moving-average envelope.
export const meta = {
  id: "c1023-pop-09",
  name: "200-day SMA with a fixed 3% envelope (whipsaw filter): in above +3%, out below -3% (equity ETFs)",
  family: "trend",
  source: "c1023/pop",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  params: { sma: 200, band: 0.03 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const s = ctx.sma("close", p.sma, i), c = bars[i].close;
  const next = st.pos === 1 ? (c < (1 - p.band) * s ? 0 : 1) : (c > (1 + p.band) * s ? 1 : 0);
  st.pos = next;
  return next;
}
