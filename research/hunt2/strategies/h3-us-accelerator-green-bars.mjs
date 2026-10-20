// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-accelerator-green-bars). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-accelerator-green-bars",
  name: "Does the Accelerator Oscillator three-green-bars rule work?",
  family: "indicator-accelerator",
  source: "retail trading content: Bill Williams Accelerator Oscillator three green bars below zero",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  rebalance: "weekly",
  params: { warmupBars: 45, fastMedianBars: 5, slowMedianBars: 34, accelerationMeanBars: 5, eventWindowBars: 5, topN: 8 },
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
    for (let k = n - 45; k < n; k++) { m[k] = (b[k].high + b[k].low) / 2; if (!Number.isFinite(m[k]) || !(b[k].close > 0)) bad = true; }
    if (bad) continue;
    const ao = (k) => {
      let f = 0, s = 0;
      for (let j = k - 4; j <= k; j++) f += m[j];
      for (let j = k - 33; j <= k; j++) s += m[j];
      return f / 5 - s / 34;
    };
    const ac = (k) => {
      let s = 0;
      for (let j = k - 4; j <= k; j++) s += ao(j);
      return ao(k) - s / 5;
    };
    const curAc = ac(n - 1);
    let best = -Infinity;
    for (let k = n - p.eventWindowBars; k < n; k++) {
      if (k - 3 < 37) continue;
      const c0 = ac(k), c1 = ac(k - 1), c2 = ac(k - 2), c3 = ac(k - 3);
      if (c0 < 0 && c3 < c2 && c2 < c1 && c1 < c0 && curAc > c3) best = Math.max(best, (c0 - c3) / b[k].close);
    }
    if (best > -Infinity) qual.push([sym, best]);
  }
  qual.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const top = qual.slice(0, Math.min(p.topN, qual.length));
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}

