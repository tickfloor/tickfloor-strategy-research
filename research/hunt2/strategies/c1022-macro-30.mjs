export const meta = {
  id: "c1022-macro-30",
  name: "Commodity trend taken only when the broad dollar is falling",
  family: "trend",
  source: "c1022/macro", // cited: Erb & Harvey (2006) The strategic and tactical value of commodity futures; Chen, Rogoff & Rossi (2010) commodity currencies
  assetClass: "etf",
  timeframe: "1d",
  assets: ["GLD", "SLV", "DBC", "USO"],
  params: { sma: 100, dollarLookback: 63 },
};

export function signal(bars, i, ctx) {
  if (i + 1 < 100 || i - 63 < 0) return 0;
  const a = ctx.macro("DTWEXBGS", i), b = ctx.macro("DTWEXBGS", i - 63);
  if (a === null || b === null) return 0;
  return bars[i].close > ctx.sma("close", 100, i) && a - b < 0 ? 1 : 0;
}
