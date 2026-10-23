// Spec: campaign-1022/prereg-macro.json c1022-macro-58 (signal, long-short).
// Long-short Treasuries (TLT, IEF) by 2y-yield momentum. Source: Bernanke & Kuttner (2005); Moskowitz-Ooi-Pedersen (2012).

export const meta = {
  id: "c1022-macro-58",
  name: "Long-short Treasuries (TLT, IEF) by 2y-yield momentum",
  family: "macro",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF"],
  longShort: true,
  params: { lookback: 63, bp: 0.25 },
};

// Nominal 2y yield known by the close of bar j: Y10 (DFII10 + T10YIE) minus the 10y-2y spread.
function y2(ctx, j) {
  const d = ctx.macro("DFII10", j), e = ctx.macro("T10YIE", j), s = ctx.macro("T10Y2Y", j);
  return d == null || e == null || s == null ? null : d + e - s;
}

export function signal(bars, i, ctx) {
  const n = ctx.params.lookback;
  if (i - n < 0) return 0;
  const a = y2(ctx, i), b = y2(ctx, i - n);
  if (a == null || b == null) return 0;
  const d = a - b;
  if (d > ctx.params.bp) return -1;
  if (d < -ctx.params.bp) return 1;
  return 0;
}
