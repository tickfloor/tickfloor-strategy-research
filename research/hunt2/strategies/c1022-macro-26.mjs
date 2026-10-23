export const meta = {
  id: "c1022-macro-26",
  name: "Bear-steepener gate for rate-sensitive assets",
  family: "macro",
  source: "c1022/macro", // cited: Ilmanen (2011) ch.9; Adrian, Crump & Moench (2013) term premium decomposition
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF", "VNQ", "XLU"],
  params: { lookback: 20 },
};

function y10(ctx, j) {
  const a = ctx.macro("DFII10", j), b = ctx.macro("T10YIE", j);
  return a === null || b === null ? null : a + b;
}

export function signal(bars, i, ctx) {
  if (i - 20 < 0) return 0;
  const y0 = y10(ctx, i), y1 = y10(ctx, i - 20);
  const c0 = ctx.macro("T10Y2Y", i), c1 = ctx.macro("T10Y2Y", i - 20);
  if (y0 === null || y1 === null || c0 === null || c1 === null) return 0;
  const bearSteepener = y0 - y1 > 0 && c0 - c1 > 0;
  return bearSteepener ? 0 : 1;
}
