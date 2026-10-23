export const meta = {
  id: "c1022-macro-15",
  name: "Yield-curve quadrant allocation (bull/bear x steepener/flattener)",
  family: "macro",
  source: "c1022/macro", // cited: Ilmanen (2011) Expected Returns ch.9; PIMCO/BlackRock curve-regime notes
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "XLU", "XLF", "DBC", "SHY", "UUP", "QQQ", "LQD"],
  rebalance: "monthly",
  params: { lookback: 63 },
};

// Spec: campaign-1022/prereg-macro.json c1022-macro-15 (rank, monthly). DEFS rank mode: macro history is
// recorded once per rank() call (null included); chg(id, 63) on a monthly cadence = s = round(63/21) = 3 calls back.
const LISTED = ["TLT", "XLU", "XLF", "DBC", "SHY", "UUP", "QQQ", "LQD"];

function basket(universe, syms) {
  const present = syms.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = 1 / present.length;
  return w;
}

export function rank(universe, t, ctx) {
  if (ctx.state.y10 === undefined) { ctx.state.y10 = []; ctx.state.sp = []; }
  const a = ctx.macro("DFII10"), b = ctx.macro("T10YIE"), c = ctx.macro("T10Y2Y");
  ctx.state.y10.push(a === null || b === null ? null : a + b); // Y10 = DFII10 + T10YIE (nominal 10y)
  ctx.state.sp.push(c);
  // PREREG FIX (mixed history): FILL until every listed symbol is present.
  if (LISTED.some((s) => !universe[s])) return basket(universe, LISTED);
  const s = Math.round(ctx.params.lookback / 21);
  const chg = (arr) => {
    const k = arr.length - 1;
    return k - s < 0 || arr[k] === null || arr[k - s] === null ? null : arr[k] - arr[k - s];
  };
  const d10 = chg(ctx.state.y10), dS = chg(ctx.state.sp);
  if (d10 === null || dS === null) return basket(universe, LISTED); // not ready -> FILL
  if (dS > 0) return d10 < 0 ? basket(universe, ["TLT", "XLU"]) : basket(universe, ["XLF", "DBC"]);
  return d10 >= 0 ? basket(universe, ["SHY", "UUP"]) : basket(universe, ["QQQ", "LQD"]);
}
