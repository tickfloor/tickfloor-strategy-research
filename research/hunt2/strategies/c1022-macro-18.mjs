export const meta = {
  id: "c1022-macro-18",
  name: "Crypto held only outside Fed tightening (2y yield momentum)",
  family: "macro",
  source: "c1022/macro", // cited: Practitioner 'liquidity regime' thesis (e.g. Howell, Capital Wars); Bernanke-Kuttner (2005)
  assetClass: "crypto",
  timeframe: "1d",
  params: { lookback: 63, bp: 0.25 },
};

function y10(ctx, j) {
  const a = ctx.macro("DFII10", j), b = ctx.macro("T10YIE", j);
  return a === null || b === null ? null : a + b;
}
function y2(ctx, j) {
  const y = y10(ctx, j), s = ctx.macro("T10Y2Y", j);
  return y === null || s === null ? null : y - s;
}

export function signal(bars, i, ctx) {
  if (i - 63 < 0) return 1;
  const a = y2(ctx, i), b = y2(ctx, i - 63);
  if (a === null || b === null) return 1;
  return a - b > 0.25 ? 0 : 1;
}
