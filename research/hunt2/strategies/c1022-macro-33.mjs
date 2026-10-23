export const meta = {
  id: "c1022-macro-33",
  name: "Stovall sector clock driven by macro state",
  family: "macro",
  source: "c1022/macro", // cited: Stovall (1996) Standard & Poor's Guide to Sector Investing; Fidelity business-cycle sector framework
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLP", "XLU", "XLV", "XLY", "XLF", "XLI", "VNQ", "XLE", "XLB", "XLK", "XLC"],
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

const ALL = ["XLP", "XLU", "XLV", "XLY", "XLF", "XLI", "VNQ", "XLE", "XLB", "XLK", "XLC"];

export function rank(universe, t, ctx) {
  record(ctx);
  const vix = at(ctx, "VIX", 0), vix3 = at(ctx, "VIX3M", 0);
  if (vix === null || vix3 === null) return equal(universe, ALL, 1);
  if (vix > vix3) return equal(universe, ["XLP", "XLU", "XLV"], 1);
  const steep = chgR(ctx, "T10Y2Y", 3);
  if (steep === null) return equal(universe, ALL, 1);
  if (steep > 0) return equal(universe, ["XLY", "XLF", "XLI", "VNQ"], 1);
  const roc = oilRoc(ctx, 3);
  if (roc === null) return equal(universe, ALL, 1);
  return roc > 0 ? equal(universe, ["XLE", "XLB", "XLV"], 1) : equal(universe, ["XLK", "XLI", "XLC"], 1);
}
