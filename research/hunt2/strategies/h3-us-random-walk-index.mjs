// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-random-walk-index). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-random-walk-index",
  name: "Does the Random Walk Index work as a stock-selection signal?",
  family: "indicator-random-walk",
  source: "retail trading content: Michael Poulos Random Walk Index stock trading strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  rebalance: "weekly",
  params: { warmupBars: 15, minimumWindow: 2, maximumWindow: 14, minimumHighRwi: 1, maximumLowRwi: 1, topN: 8 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const qual = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const N = b.length;
    if (N < p.warmupBars) continue;
    const i = N - 1;
    const tr = new Float64Array(15);
    let bad = false;
    for (let j = 0; j < 15; j++) {
      const k = i - 14 + j, q = b[k];
      if (![q.open, q.high, q.low, q.close].every((x) => Number.isFinite(x) && x > 0)) { bad = true; break; }
      if (j > 0) tr[j] = Math.max(q.high - q.low, Math.abs(q.high - b[k - 1].close), Math.abs(q.low - b[k - 1].close));
    }
    if (bad) continue;
    let hiR = -Infinity, loR = -Infinity;
    for (let n = p.minimumWindow; n <= p.maximumWindow && !bad; n++) {
      let s = 0;
      for (let j = 15 - n; j < 15; j++) s += tr[j];
      const a = s / n;
      if (!(a > 0)) { bad = true; break; }
      const d = a * Math.sqrt(n);
      hiR = Math.max(hiR, (b[i].high - b[i - n].low) / d);
      loR = Math.max(loR, (b[i - n].high - b[i].low) / d);
    }
    if (bad) continue;
    if (hiR >= p.minimumHighRwi && loR <= p.maximumLowRwi && hiR > loR) qual.push([sym, hiR - loR]);
  }
  qual.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const top = qual.slice(0, Math.min(p.topN, qual.length));
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}

