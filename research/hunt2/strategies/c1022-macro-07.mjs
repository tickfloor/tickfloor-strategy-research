export const meta = {
  id: "c1022-macro-07",
  name: "Moreira-Muir volatility-managed index using implied vol (target 15)",
  family: "volatility",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  rebalance: "daily",
  params: { target: 15, cap: 1 },
};

export function rank(universe, t, ctx) {
  const v = ctx.macro("VIX");
  if (v === null || !(v > 0)) return {};
  const present = ["QQQ", "DIA"].filter((s) => Object.hasOwn(universe, s));
  if (present.length === 0) return {};
  const w = Math.min(ctx.params.cap, (ctx.params.target / v) ** 2);
  const out = {};
  for (const s of present) out[s] = w / present.length; // prereg fix: w/k on present names
  return out;
}
