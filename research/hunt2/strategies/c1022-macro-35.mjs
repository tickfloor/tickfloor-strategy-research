export const meta = {
  id: "c1022-macro-35",
  name: "Sector momentum with an a-priori macro-driver veto",
  family: "momentum",
  source: "c1022/macro", // cited: Asness, Moskowitz & Pedersen (2013) Value and momentum everywhere; Brooks (2017) macro momentum
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  params: { mom: 126, topN: 3, lookback: 63 },
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

const SEC = ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"];

export function rank(universe, t, ctx) {
  record(ctx);
  const scored = [];
  for (const s of SEC) {
    const b = universe[s];
    if (!b || b.length < 127) continue;
    scored.push([s, b[b.length - 1].close / b[b.length - 127].close - 1]);
  }
  scored.sort(byReturn);
  const keep = [];
  for (const [s] of scored.slice(0, 3)) {
    let ok = true;
    if (s === "XLE") {
      const r = oilRoc(ctx, 3);
      if (r === null) return equal(universe, SEC, 1);
      ok = r > 0;
    } else if (s === "XLF") {
      const c = chgR(ctx, "T10Y2Y", 3);
      if (c === null) return equal(universe, SEC, 1);
      ok = c > 0;
    } else if (["XLK", "XLC", "XLY", "VNQ", "XLU"].includes(s)) {
      const c = chgR(ctx, "DFII10", 3);
      if (c === null) return equal(universe, SEC, 1);
      ok = c <= 0.25;
    } else if (s === "XLB" || s === "XLI") {
      const c = chgR(ctx, "DTWEXBGS", 3);
      if (c === null) return equal(universe, SEC, 1);
      ok = c <= 0;
    }
    if (ok) keep.push(s);
  }
  const w = {};
  for (const s of keep) w[s] = 1 / 3;
  return w;
}
