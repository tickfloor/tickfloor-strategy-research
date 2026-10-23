export const meta = {
  id: "c1022-macro-31",
  name: "Oil-driven sector switch: producers vs oil consumers",
  family: "macro",
  source: "c1022/macro", // cited: Driesprong, Jacobsen & Maat (2008) Striking oil; Kilian & Park (2009) oil shocks and the stock market
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLE", "XLY", "XLI", "DIA"],
  rebalance: "monthly",
  params: { lookback: 63, th: 0.1 },
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

export function rank(universe, t, ctx) {
  record(ctx);
  const roc = oilRoc(ctx, 3);
  if (roc === null) return equal(universe, ["XLE", "XLY", "XLI", "DIA"], 1);
  if (roc > 0.1) return equal(universe, ["XLE"], 1);
  if (roc < -0.1) return equal(universe, ["XLY", "XLI"], 1);
  return equal(universe, ["DIA"], 1);
}
