export const meta = {
  id: "c1022-macro-20",
  name: "Inflation-momentum sector map (reflation vs disinflation baskets)",
  family: "macro",
  source: "c1022/macro", // cited: Neville, Draaisma, Funnell, Harvey & van Hemert (2021) The best strategies for inflationary times
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLE", "XLB", "XLF", "DBC", "XLK", "XLU", "VNQ", "TLT"],
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

const REFLATION = ["XLE", "XLB", "XLF", "DBC"];
const DISINFLATION = ["XLK", "XLU", "VNQ", "TLT"];

export function rank(universe, t, ctx) {
  record(ctx);
  const d = chgR(ctx, "T10YIE", 3);
  if (d === null) return equal(universe, REFLATION.concat(DISINFLATION), 1);
  return d > 0 ? equal(universe, REFLATION, 1) : equal(universe, DISINFLATION, 1);
}
