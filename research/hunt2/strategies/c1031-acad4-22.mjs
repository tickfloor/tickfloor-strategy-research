// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-22). Source: Campbell 1991, 'A variance decomposition for stock returns', Economic Journal 101(405), 15
export const meta = {
  id: "c1031-acad4-22",
  name: "Detrended 10-year yield gate: hold equity ETFs only while the 10-year nominal yield is below its 12-month mean (Campbell; Ang-Bekaert)",
  family: "macro",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  longShort: false,
  params: { window: 252 },
};

export function signal(bars, i, ctx) {
  if (ctx.state.win === undefined) ctx.state.win = ctx.rolling(ctx.params.window);
  const real = ctx.macro("DFII10", i);
  const be = ctx.macro("T10YIE", i);
  if (!Number.isFinite(real) || !Number.isFinite(be)) return 0;
  const y = real + be;
  const win = ctx.state.win;
  win.push(y);
  if (!win.full()) return 0;
  return y < win.mean() ? 1 : 0;
}
