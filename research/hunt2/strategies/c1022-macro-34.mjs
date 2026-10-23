export const meta = {
  id: "c1022-macro-34",
  name: "Macro-momentum allocation across stocks, bonds, commodities and gold",
  family: "macro",
  source: "c1022/macro", // cited: Brooks (2017) A half century of macro momentum, AQR
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "TLT", "IEF", "DBC", "USO", "GLD"],
  rebalance: "monthly",
  params: { lookback: 126 },
};

const SERIES = ["DFII10", "T10YIE", "T10Y2Y", "DCOILWTICO", "DTWEXBGS", "VIX", "VIX3M"];
function record(ctx) {
  if (ctx.state.h === undefined) {
    ctx.state.h = {};
    for (const id of SERIES) ctx.state.h[id] = [];
  }
  for (const id of SERIES) ctx.state.h[id].push(ctx.macro(id));
}
function at(ctx, id, s) {
  const a = ctx.state.h[id];
  const k = a.length - 1 - s;
  return k < 0 ? null : a[k];
}
function chgR(ctx, id, s) {
  const x = at(ctx, id, 0), y = at(ctx, id, s);
  return x === null || y === null ? null : x - y;
}
function oilRoc(ctx, s) {
  const x = at(ctx, "DCOILWTICO", 0), y = at(ctx, "DCOILWTICO", s);
  return x === null || y === null || y === 0 ? null : x / y - 1;
}
function sgn(x) { return x > 0 ? 1 : x < 0 ? -1 : 0; }
function equal(universe, syms, total) {
  const present = syms.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = total / present.length;
  return w;
}
function byReturn(a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0); }

const ALL = ["QQQ", "DIA", "TLT", "IEF", "DBC", "USO", "GLD"];

export function rank(universe, t, ctx) {
  record(ctx);
  if (ALL.some((s) => !universe[s])) return equal(universe, ALL, 1);
  const steep = chgR(ctx, "T10Y2Y", 6);
  const vix3 = chgR(ctx, "VIX3M", 6);
  const ie = chgR(ctx, "T10YIE", 6);
  const dfii = chgR(ctx, "DFII10", 6);
  const usd = chgR(ctx, "DTWEXBGS", 6);
  const oil = oilRoc(ctx, 6);
  if ([steep, vix3, ie, dfii, usd, oil].some((x) => x === null)) return equal(universe, ALL, 1);
  const sleeves = [
    [sgn(steep) + sgn(-vix3), ["QQQ", "DIA"]],
    [sgn(-ie) + sgn(-oil), ["TLT", "IEF"]],
    [sgn(ie) + sgn(-usd), ["DBC", "USO"]],
    [sgn(-dfii) + sgn(-usd), ["GLD"]],
  ];
  const held = sleeves.filter((x) => x[0] > 0);
  if (held.length === 0) return {};
  const w = {};
  for (const [, members] of held) {
    for (const s of members) w[s] = 1 / held.length / members.length;
  }
  return w;
}
