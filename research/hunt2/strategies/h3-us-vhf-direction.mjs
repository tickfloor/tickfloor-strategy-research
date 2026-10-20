// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-vhf-direction). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-vhf-direction",
  name: "Does the Vertical Horizontal Filter identify stock trends worth buying?",
  family: "indicator-vhf",
  source: "retail trading content: Vertical Horizontal Filter Adam White stock trend strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  rebalance: "weekly",
  params: { warmupBars: 29, lookbackBars: 28, minimumVhf: 0.4, topN: 8 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const qual = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const n = b.length;
    if (n < p.warmupBars) continue;
    let hi = -Infinity, lo = Infinity, den = 0, bad = false;
    for (let k = n - 29; k < n; k++) {
      const c = b[k].close;
      if (!Number.isFinite(c) || !(c > 0)) { bad = true; break; }
      if (k >= n - 28) { hi = Math.max(hi, c); lo = Math.min(lo, c); den += Math.abs(c - b[k - 1].close); }
    }
    if (bad || !(den > 0)) continue;
    const vhf = (hi - lo) / den;
    if (vhf >= p.minimumVhf && b[n - 1].close > b[n - 29].close) qual.push([sym, vhf]);
  }
  qual.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const top = qual.slice(0, Math.min(p.topN, qual.length));
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}

