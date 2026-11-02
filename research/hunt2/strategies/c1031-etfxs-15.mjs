// Spec: research/hunt2/campaign-1031/prereg-etfxs.json (c1031-etfxs-15). Trend t-statistic of the 126-day log-price slope, top 6 held.
export const meta = {
  id: "c1031-etfxs-15",
  name: "Trend t-statistic ranking: top 6 of 25 ETFs by the t-stat of the 126-day log-price slope, monthly",
  family: "trend",
  source: "c1031/etfxs",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "monthly",
  params: { window: 126, top: 6, minPicks: 3 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const n = p.window;
  const xbar = (n - 1) / 2;
  let sxx = 0;
  for (let x = 0; x < n; x++) sxx += (x - xbar) ** 2;
  const tstats = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= 127) continue;
    const e = b.length - 1;
    const y = [];
    for (let k = e - n + 1; k <= e; k++) y.push(Math.log(b[k].close));
    const ybar = y.reduce((a, v) => a + v, 0) / n;
    let sxy = 0;
    for (let x = 0; x < n; x++) sxy += (x - xbar) * (y[x] - ybar);
    const beta = sxy / sxx;
    const alpha = ybar - beta * xbar;
    let sse = 0;
    for (let x = 0; x < n; x++) sse += (y[x] - (alpha + beta * x)) ** 2;
    const se = Math.sqrt(sse / (n - 2) / sxx);
    tstats.push([s, beta / se]);
  }
  if (tstats.length < 10) return {};
  const cands = tstats.filter(([, tv]) => tv > 0).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  if (cands.length < p.minPicks) return {};
  const held = cands.slice(0, p.top);
  const w = {};
  for (const [s] of held) w[s] = 1 / held.length;
  return w;
}
