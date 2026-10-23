export const meta = {
  id: "c1022-macro-16",
  name: "Fed tightening regime gate: flat equities when the 2y yield rose 25bp in a quarter",
  family: "macro",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: { lookback: 63, bp: 0.25 },
};

// Y2 = Y10 - T10Y2Y, Y10 = DFII10 + T10YIE (pct pts). Null if any component is null.
function y2(i, ctx) {
  const a = ctx.macro("DFII10", i);
  const b = ctx.macro("T10YIE", i);
  const c = ctx.macro("T10Y2Y", i);
  if (a === null || b === null || c === null) return null;
  return a + b - c;
}

export function signal(bars, i, ctx) {
  const n = ctx.params.lookback;
  const now = y2(i, ctx);
  const then = i - n >= 0 ? y2(i - n, ctx) : null;
  if (now === null || then === null) return 1;
  return now - then > ctx.params.bp ? 0 : 1;
}
