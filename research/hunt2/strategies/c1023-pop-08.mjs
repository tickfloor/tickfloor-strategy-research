// Spec: research/hunt2/campaign-1023/prereg-pop.json (c1023-pop-08). Golden-cross regime with an RSI(14) profit-take (Investopedia 'Golden Cross', 'RSI overbought').
export const meta = {
  id: "c1023-pop-08",
  name: "Golden cross long with an RSI(14) overbought profit-take: out at RSI 75, back in at RSI 55 (equity ETFs)",
  family: "trend",
  source: "c1023/pop",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  params: { fast: 50, slow: 200, rsi: 14, tpLevel: 75, reentry: 55 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  const bull = ctx.sma("close", p.fast, i) > ctx.sma("close", p.slow, i);
  const r = ctx.rsi(p.rsi, i);
  // Long: hold while bull and RSI below the take-profit level. Flat: enter when bull and RSI has cooled to reentry.
  const next = st.pos === 1 ? (bull && r < p.tpLevel ? 1 : 0) : (bull && r <= p.reentry ? 1 : 0);
  st.pos = next;
  return next;
}
