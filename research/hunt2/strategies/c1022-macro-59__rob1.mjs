// Spec: campaign-1022/prereg-macro.json c1022-macro-59 (rank, monthly).
// Vol-curve x real-rate quadrant allocation. Source: Ilmanen (2011); Baur & Lucey (2010).
const BASKET = ["QQQ", "GLD", "DIA", "SHY"];

export const meta = {
  id: "c1022-macro-59__rob1",
  name: "Vol-curve x real-rate quadrant allocation (-25%)",
  family: "macro",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: BASKET,
  rebalance: "monthly",
  params: { lookback: 63 },
};

// Equal weight across the listed symbols present in universe (FILL).
function ew(universe, list) {
  const present = list.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = 1 / present.length;
  return w;
}

export function rank(universe, t, ctx) {
  if (ctx.state.vix === undefined) { ctx.state.vix = []; ctx.state.vix3m = []; ctx.state.dfii = []; }
  ctx.state.vix.push(ctx.macro("VIX"));
  ctx.state.vix3m.push(ctx.macro("VIX3M"));
  ctx.state.dfii.push(ctx.macro("DFII10"));
  const S = ctx.state;
  const k = S.vix.length - 1;
  // 63 days on a monthly cadence = 3 rebalance calls back (round(63/21)).
  const s = 2;
  if (BASKET.some((x) => !universe[x])) return ew(universe, BASKET);
  const vix = S.vix[k], vix3m = S.vix3m[k], dNow = S.dfii[k], dPast = k - s >= 0 ? S.dfii[k - s] : null;
  if (vix == null || vix3m == null || dNow == null || dPast == null) return ew(universe, BASKET);
  const contango = vix < vix3m;
  const rrDown = dNow - dPast <= 0;
  const pick = contango ? (rrDown ? "QQQ" : "DIA") : (rrDown ? "GLD" : "SHY");
  return { [pick]: 1 };
}
