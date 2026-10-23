export const meta = {
  id: "c1022-macro-10",
  name: "Complacency exit: flat when VIX is in its bottom decile",
  family: "volatility",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  params: { window: 252, pct: 0.1 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.arr === undefined) ctx.state.arr = [];
  const v = ctx.macro("VIX", i);
  if (v === null) return 0;
  const arr = ctx.state.arr;
  arr.push(v);
  if (arr.length > p.window) arr.shift();
  if (arr.length < p.window) return 1; // rule's base state while the window is short
  let le = 0;
  for (const x of arr) if (x <= v) le++;
  return le / p.window < p.pct ? 0 : 1;
}
