export const meta = {
  id: "c1022-macro-23__rob2",
  name: "A-priori duration-sector switch by real-yield momentum (+25%)",
  family: "macro",
  source: "c1022/macro", // cited: Gormsen & Lazarus (2023) Duration-driven returns; Dechow, Sloan & Soliman (2004) implied equity duration
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLC", "XLY", "VNQ", "XLU", "XLF", "XLE", "XLB", "XLI", "XLP"],
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

const LONG_DURATION = ["XLK", "XLC", "XLY", "VNQ", "XLU"];
const SHORT_DURATION = ["XLF", "XLE", "XLB", "XLI", "XLP"];

export function rank(universe, t, ctx) {
  record(ctx);
  const d = chgR(ctx, "DFII10", 4);
  if (d === null) return equal(universe, LONG_DURATION.concat(SHORT_DURATION), 1);
  return d <= 0 ? equal(universe, LONG_DURATION, 1) : equal(universe, SHORT_DURATION, 1);
}
