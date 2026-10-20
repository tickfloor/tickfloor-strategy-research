// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-bump-and-run). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-bump-and-run",
  name: "Does the bearish bump-and-run reversal pattern work on stocks?",
  family: "chart-bump-and-run",
  source: "retail trading content: bearish bump and run reversal daily stock pattern",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: true,
  params: { warmupBars: 64, pivotSideBars: 2, pivotSearchBars: 60, minimumPivotSeparation: 5, minimumPivotRise: 0.02, atrPeriod: 14, minimumOvershootAtr: 3, returnLookbackBars: 20, minimumBumpReturn: 0.1, armBars: 30, stopAtr: 2, targetAtr: 4, holdBars: 20, cooldownBars: 1 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.armed = false; s.consumed = -1; s.cool = 0; }
  const atr = ctx.atr(p.atrPeriod, i);
  const c = bars[i].close;
  if (i + 1 < p.warmupBars || !(atr > 0) || !isFinite(atr)) { s.armed = false; s.pos = 0; return 0; }
  if (s.pos === -1) {
    if (c >= s.entry + p.stopAtr * s.eAtr || c <= s.entry - p.targetAtr * s.eAtr || i - s.eIdx >= p.holdBars) {
      s.pos = 0; s.cool = p.cooldownBars; return 0;
    }
    return -1;
  }
  if (s.cool > 0) { s.cool--; return 0; }
  if (s.armed) {
    if (i - s.armIdx > p.armBars) s.armed = false;
    else {
      const line = s.lowA + (s.lowB - s.lowA) * (i - s.a) / (s.b - s.a);
      if (c < line) { s.armed = false; s.pos = -1; s.entry = c; s.eAtr = atr; s.eIdx = i; return -1; }
      return 0;
    }
  }
  // find latest two confirmed low pivots in trailing 60 visible bars
  let b = -1, a = -1;
  for (let j = i - 2; j >= Math.max(2, i - p.pivotSearchBars + 1); j--) {
    const l = bars[j].low;
    if (l < bars[j - 1].low && l < bars[j - 2].low && l < bars[j + 1].low && l < bars[j + 2].low) {
      if (b < 0) b = j; else { a = j; break; }
    }
  }
  if (a < 0 || b === s.consumed || b - a < p.minimumPivotSeparation) return 0;
  const lowA = bars[a].low, lowB = bars[b].low;
  if (lowB / lowA - 1 < p.minimumPivotRise) return 0;
  const P = lowA + (lowB - lowA) * (i - a) / (b - a);
  if (i >= p.returnLookbackBars && c >= P + p.minimumOvershootAtr * atr && c / bars[i - p.returnLookbackBars].close - 1 >= p.minimumBumpReturn) {
    s.armed = true; s.armIdx = i; s.a = a; s.b = b; s.lowA = lowA; s.lowB = lowB; s.consumed = b;
  }
  return 0;
}
