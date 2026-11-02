export const meta = {
  id: "c1031-macro-05",
  name: "VIX percentile exposure scaling: equity weight = 1 minus the VIX's 3-year percentile, remainder in SHY, weekly",
  family: "volatility",
  source: "c1031/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "SHY"],
  rebalance: "weekly",
  params: { minHist: 52, histWeeks: 156 },
};

// Rank mode: ctx.macro(id) has no look-back, so the VIX history lives in ctx.state (one push per rebalance).
export function rank(universe, t, ctx) {
  const p = ctx.params;
  if (ctx.state.h === undefined) ctx.state.h = [];
  const v = ctx.macro("VIXCLS");
  if (v === null) return { QQQ: 0.5, DIA: 0.5 };
  const h = ctx.state.h;
  h.push(v);
  if (h.length < p.minHist) return { QQQ: 0.5, DIA: 0.5 };
  const win = h.slice(Math.max(0, h.length - p.histWeeks));
  let le = 0;
  for (const x of win) if (x <= v) le++;
  const e = 1 - le / win.length;
  return { QQQ: e / 2, DIA: e / 2, SHY: 1 - e };
}
