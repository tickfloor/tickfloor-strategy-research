// c1022 red-team spec 42 (campaign-1022/prereg-redteam.json, frozen before code).
// Zweig 1986; Faber 2007; breadth-pct200-timing-gate (stock version). Sector breadth with
// hysteresis (60% above 200-day in, 40% out), else IEF, weekly.
export const meta = {
  id: "c1022-redteam-42",
  name: "Sector breadth gate with hysteresis (60% above 200-day in, 40% out), else IEF, weekly",
  family: "breadth",
  source: "c1022/redteam",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "IEF"],
  rebalance: "weekly",
  params: { sma: 200, on: 0.6, off: 0.4, need: 202 },
};

function ew(u) {
  const s = Object.keys(u);
  const w = {};
  for (const x of s) w[x] = 1 / s.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { sma, need } = ctx.params;
  const onT = ctx.params.on;
  const offT = ctx.params.off;
  if (ctx.state.on === undefined) ctx.state.on = false;

  // sectors = every symbol in the view except IEF
  const sectors = Object.keys(universe).filter((s) => s !== "IEF");
  let m = 0;
  let above = 0;
  const held = [];
  for (const sym of sectors) {
    const b = universe[sym];
    if (b.length < need) continue;
    m++;
    held.push(sym);
    const e = b.length - 1;
    let s = 0;
    for (let k = e - sma + 1; k <= e; k++) s += b[k].close;
    if (b[e].close > s / sma) above++;
  }

  if (m < 6) return ew(universe); // breadth undefined, state unchanged

  const breadth = above / m;
  if (breadth >= onT) ctx.state.on = true;
  else if (breadth <= offT) ctx.state.on = false;

  // ponytail: no IEF bar that day (data gap) -> cash, same call as c1022-redteam-36.
  if (!ctx.state.on) return universe.IEF ? { IEF: 1 } : {};
  const w = {};
  for (const sym of held) w[sym] = 1 / m;
  return w;
}
