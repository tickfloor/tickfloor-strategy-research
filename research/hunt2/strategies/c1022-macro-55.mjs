// Spec: campaign-1022/prereg-macro.json c1022-macro-55 (signal).
// Energy stack (XLE + USO) with both oil and dollar tailwinds. Source: Kilian & Park (2009); Chen, Rogoff & Rossi (2010).

export const meta = {
  id: "c1022-macro-55",
  name: "Energy stack (XLE + USO) with both oil and dollar tailwinds",
  family: "macro",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLE", "USO"],
  params: { lookback: 63 },
};

function chg(ctx, id, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro(id, i), b = ctx.macro(id, i - n);
  return a == null || b == null ? null : a - b;
}

function oilRoc(ctx, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro("DCOILWTICO", i), b = ctx.macro("DCOILWTICO", i - n);
  return a == null || b == null || b === 0 ? null : a / b - 1;
}

export function signal(bars, i, ctx) {
  const n = ctx.params.lookback;
  const oil = oilRoc(ctx, i, n);
  const dollar = chg(ctx, "DTWEXBGS", i, n);
  if (oil === null || dollar === null) return 0;
  return oil > 0 && dollar < 0 ? 1 : 0;
}
