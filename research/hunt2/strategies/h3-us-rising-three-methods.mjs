// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-rising-three-methods). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-rising-three-methods",
  name: "Does the rising-three-methods continuation pattern work?",
  family: "candle-patterns",
  source: "retail trading content: rising three methods five candle continuation stock strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  params: { warmupBars: 20, atrPeriod: 14, impulseBodyAtr: 1, pauseBodyFraction: 0.5, pauseBars: 3, targetAtr: 3, holdBars: 15, cooldownBars: 1 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entry = 0; s.entryIdx = -1; s.entryAtr = 0; s.low = 0; s.cd = 0; }
  const c = bars[i];
  const atr = ctx.atr(14, i);
  if (i + 1 < p.warmupBars || !(atr > 0) || !Number.isFinite(c.close) || !Number.isFinite(c.open) || !Number.isFinite(c.low)) { s.pos = 0; s.cd = 0; return 0; }
  if (s.pos === 1) {
    if (c.close <= s.low || c.close >= s.entry + p.targetAtr * s.entryAtr || i - s.entryIdx >= p.holdBars) { s.pos = 0; s.cd = p.cooldownBars; return 0; }
    return 1;
  }
  if (s.cd > 0) { s.cd--; return 0; }

  if (i < 4) return 0;
  const a = bars[i - 4];
  const body = a.close - a.open;
  const atrA = ctx.atr(14, i - 4);
  let ok = a.close > a.open && atrA > 0 && body >= p.impulseBodyAtr * atrA && c.close > c.open && c.close > a.high && bars[i - 1].close < a.close;
  let LOW = Infinity;
  for (let k = i - 3; ok && k <= i - 1; k++) {
    const q = bars[k];
    if (!(q.high < a.high && q.low > a.low && Math.abs(q.close - q.open) <= p.pauseBodyFraction * body)) ok = false;
    LOW = Math.min(LOW, q.low);
  }
  if (!ok) return 0;
  s.pos = 1; s.entry = c.close; s.entryIdx = i; s.entryAtr = atr; s.low = LOW;
  return 1;
}

