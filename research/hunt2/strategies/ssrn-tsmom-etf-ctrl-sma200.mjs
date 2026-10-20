// SSRN run 1, control C2 (ETFs): equal-weight 200-bar SMA gate. Monthly rebalance; weight 1/N for each asset closing above its SMA200, rest cash.
export const meta = {
  id: "ssrn-tsmom-etf-ctrl-sma200",
  name: "Control C2: equal-weight SMA200 gate (ETFs)",
  family: "deep-validation-control",
  source: "Dumb control C2 for run 1; prereg research/prereg-2026-10-07-ssrn.md",
  assetClass: "etf",
  timeframe: "1d",
  universe: "ETFS_DAILY",
  rebalance: "monthly",
  params: { win: 200 },
};

export function rank(universe, t, ctx) {
  const { win } = ctx.params;
  const up = [];
  let N = 0;
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const n = b.length;
    if (n < win) continue;
    N++;
    let s = 0;
    for (let k = n - win; k < n; k++) s += b[k].close;
    if (b[n - 1].close > s / win) up.push(sym);
  }
  if (N < 2) return {};
  const w = {};
  for (const sym of up) w[sym] = 1 / N;
  return w;
}
