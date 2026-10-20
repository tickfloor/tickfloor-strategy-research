// SSRN run 3, control C2: the same rule with the top tercile dropped by plain total volatility (sd of the same 336 daily returns), not idiosyncratic risk.
export const meta = {
  id: "ssrn-mom-totvol-t3-ctrl",
  name: "Control C2: 12-1 momentum excluding the top tercile by total volatility (wide US stocks)",
  family: "deep-validation-control",
  source: "Mechanism-matched dumb control for run 3; prereg research/prereg-2026-10-07-ssrn.md",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "monthly",
  params: { lookback: 252, skip: 21, top: 4, win: 336 },
};

export function rank(universe, t, ctx) {
  const { lookback, skip, top, win } = ctx.params;
  const scored = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length < win + 1) continue;
    let m = 0;
    for (let k = b.length - win; k < b.length; k++) m += b[k].close / b[k - 1].close - 1;
    m /= win;
    let ss = 0;
    for (let k = b.length - win; k < b.length; k++) ss += (b[k].close / b[k - 1].close - 1 - m) ** 2;
    scored.push([sym, Math.sqrt(ss / (win - 1)), b[b.length - 1 - skip].close / b[b.length - 1 - lookback].close - 1]);
  }
  if (scored.length < top * 3) return {};
  scored.sort((p, q) => q[1] - p[1] || (p[0] < q[0] ? -1 : 1));
  const keep = scored.slice(Math.floor(scored.length / 3));
  keep.sort((p, q) => q[2] - p[2] || (p[0] < q[0] ? -1 : 1));
  const w = {};
  for (const [sym] of keep.slice(0, top)) w[sym] = 1 / top;
  return w;
}
