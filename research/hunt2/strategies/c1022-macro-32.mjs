export const meta = {
  id: "c1022-macro-32",
  name: "Four macro-driven sector pairs, equal weight",
  family: "macro",
  source: "c1022/macro", // cited: Murphy (2004) Intermarket Analysis; Ilmanen (2011)
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLE", "XLY", "XLF", "XLU", "VNQ", "XLP", "GLD", "UUP"],
  rebalance: "monthly",
  params: { lookback: 63 },
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

const ALL = ["XLE", "XLY", "XLF", "XLU", "VNQ", "XLP", "GLD", "UUP"];

export function rank(universe, t, ctx) {
  record(ctx);
  const roc = oilRoc(ctx, 3);
  const c2 = chgR(ctx, "T10Y2Y", 3);
  const c3 = chgR(ctx, "DFII10", 3);
  const c4 = chgR(ctx, "DTWEXBGS", 3);
  if (roc === null || c2 === null || c3 === null || c4 === null) return equal(universe, ALL, 1);
  const picks = [
    roc > 0 ? "XLE" : "XLY",
    c2 > 0 ? "XLF" : "XLU",
    c3 <= 0 ? "VNQ" : "XLP",
    c4 < 0 ? "GLD" : "UUP",
  ];
  const w = {};
  for (const s of picks) if (universe[s]) w[s] = (w[s] || 0) + 0.25;
  return w;
}
