export const meta = {
  id: "c1022-macro-17",
  name: "Fed regime sector rotation: tightening vs easing baskets by 2y yield momentum",
  family: "macro",
  source: "c1022/macro", // cited: Jensen, Johnson & Mercer (1996) Business conditions, monetary policy and expected security returns
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLF", "XLE", "XLP", "SHY", "XLK", "VNQ", "XLU", "TLT"],
  rebalance: "monthly",
  params: { lookback: 63 },
};

// Spec: campaign-1022/prereg-macro.json c1022-macro-17 (rank, monthly). DEFS rank mode: Y2 = DFII10 + T10YIE - T10Y2Y
// recorded once per rank() call (null included); chg(Y2, 63) on a monthly cadence = s = round(63/21) = 3 calls back.
const TIGHT = ["XLF", "XLE", "XLP", "SHY"];
const EASE = ["XLK", "VNQ", "XLU", "TLT"];

function basket(universe, syms) {
  const present = syms.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = 1 / present.length;
  return w;
}

export function rank(universe, t, ctx) {
  if (ctx.state.y2 === undefined) ctx.state.y2 = [];
  const a = ctx.macro("DFII10"), b = ctx.macro("T10YIE"), c = ctx.macro("T10Y2Y");
  const h = ctx.state.y2;
  h.push(a === null || b === null || c === null ? null : a + b - c);
  const s = Math.round(ctx.params.lookback / 21);
  const k = h.length - 1;
  if (k - s < 0 || h[k] === null || h[k - s] === null) return basket(universe, TIGHT.concat(EASE)); // not ready -> FILL
  return h[k] - h[k - s] > 0 ? basket(universe, TIGHT) : basket(universe, EASE);
}
