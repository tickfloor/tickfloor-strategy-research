// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-awesome-saucer). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-awesome-saucer",
  name: "Does the Awesome Oscillator saucer setup work on stocks?",
  family: "indicator-awesome",
  source: "retail trading content: Bill Williams Awesome Oscillator bullish saucer strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  rebalance: "weekly",
  params: { warmupBars: 42, fastMedianBars: 5, slowMedianBars: 34, eventWindowBars: 5, topN: 8 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const qual = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const n = b.length;
    if (n < p.warmupBars) continue;
    const m = new Float64Array(n);
    let bad = false;
    for (let k = n - 42; k < n; k++) { m[k] = (b[k].high + b[k].low) / 2; if (!Number.isFinite(m[k]) || !(b[k].close > 0)) bad = true; }
    if (bad) continue;
    const ao = (k) => {
      let f = 0, s = 0;
      for (let j = k - 4; j <= k; j++) f += m[j];
      for (let j = k - 33; j <= k; j++) s += m[j];
      return f / 5 - s / 34;
    };
    const cur = ao(n - 1);
    if (!(cur > 0)) continue;
    let best = -Infinity;
    for (let k = n - p.eventWindowBars; k < n; k++) {
      if (k - 3 < 33) continue;
      const a0 = ao(k), a1 = ao(k - 1), a2 = ao(k - 2), a3 = ao(k - 3);
      if (a2 > 0 && a1 > 0 && a0 > 0 && a2 < a3 && a1 < a2 && a0 > a1) best = Math.max(best, (a0 - a1) / b[k].close);
    }
    if (best > -Infinity) qual.push([sym, best]);
  }
  qual.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const top = qual.slice(0, Math.min(p.topN, qual.length));
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}

