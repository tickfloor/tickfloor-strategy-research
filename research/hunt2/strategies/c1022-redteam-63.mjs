// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-63), frozen before code.
// Refs: Antonacci 2014; Zweig 1986; Moskowitz & Grinblatt 1999 JF.
export const meta = {
  id: "c1022-redteam-63",
  name: "Sector momentum top 3 (6 months) gated by sector breadth hysteresis, else IEF",
  family: "momentum",
  source: "c1022/redteam",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "IEF"],
  rebalance: "monthly",
  params: { lookback: 126, top: 3, sma: 200, on: 0.6, off: 0.4, need: 202 },
};

function ew(syms) {
  const w = {};
  for (const s of syms) w[s] = 1 / syms.length;
  return w;
}

function smaAt(b, W) {
  let s = 0;
  for (let j = b.length - W; j < b.length; j++) s += b[j].close;
  return s / W;
}

export function rank(universe, t, ctx) {
  const P = ctx.params;
  if (ctx.state.on === undefined) ctx.state.on = false;
  const syms = Object.keys(universe);
  const sectors = syms.filter((s) => s !== "IEF");

  let m = 0, above = 0;
  for (const s of sectors) {
    const b = universe[s];
    if (b.length < P.need) continue;
    m++;
    if (b[b.length - 1].close > smaAt(b, P.sma)) above++;
  }
  if (m < 6) return syms.length ? ew(syms) : {}; // breadth undefined: ew, state unchanged

  const breadth = above / m;
  if (breadth >= P.on) ctx.state.on = true;
  else if (breadth <= P.off) ctx.state.on = false;

  // ponytail: no IEF bar that day (data gap) -> cash, same call as c1022-redteam-36.
  if (!ctx.state.on) return universe.IEF ? { IEF: 1 } : {};

  const cand = [];
  for (const s of sectors) {
    const b = universe[s];
    if (b.length < P.lookback + 1) continue;
    const e = b.length - 1;
    cand.push([s, b[e].close / b[e - P.lookback].close - 1]);
  }
  cand.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const w = {};
  for (const [s] of cand.slice(0, P.top)) w[s] = 1 / P.top;
  return w;
}
