// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-center-of-gravity). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-center-of-gravity",
  name: "Does the Ehlers Center of Gravity oscillator work on stocks?",
  family: "indicator-center-of-gravity",
  source: "retail trading content: Ehlers Center of Gravity oscillator turning point stock strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  params: { warmupBars: 20, gravityBars: 10, atrPeriod: 14, stopAtr: 2, holdBars: 10, cooldownBars: 1 },
};

function G(bars, k, n) {
  let num = 0, den = 0;
  for (let j = 0; j < n; j++) {
    const b = bars[k - j];
    const m = (b.high + b.low) / 2;
    num += (j + 1) * m; den += m;
  }
  return den > 0 && isFinite(den) ? 5.5 - num / den : NaN;
}

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.cool = 0; }
  const atr = ctx.atr(p.atrPeriod, i);
  const b = bars[i];
  if (i + 1 < p.warmupBars || !(atr > 0) || !isFinite(atr) || !isFinite(b.high) || !isFinite(b.low) || !isFinite(b.close)) {
    s.pos = 0; s.cool = 0; return 0;
  }
  const g0 = G(bars, i, p.gravityBars), g1 = G(bars, i - 1, p.gravityBars), g2 = G(bars, i - 2, p.gravityBars);
  if (!isFinite(g0) || !isFinite(g1) || !isFinite(g2)) { s.pos = 0; s.cool = 0; return 0; }
  if (s.pos === 1) {
    if ((g0 < g1 && g1 >= g2) || b.close <= s.entry - p.stopAtr * s.eAtr || i - s.eIdx >= p.holdBars) {
      s.pos = 0; s.cool = p.cooldownBars; return 0;
    }
    return 1;
  }
  if (s.cool > 0) { s.cool--; return 0; }
  if (g1 < 0 && g1 <= g2 && g0 > g1) { s.pos = 1; s.entry = b.close; s.eAtr = atr; s.eIdx = i; return 1; }
  return 0;
}
