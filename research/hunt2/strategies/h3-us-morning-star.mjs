// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-morning-star). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-morning-star",
  name: "Does the morning-star candlestick pattern work on stocks?",
  family: "candle-patterns",
  source: "retail trading content: morning star candlestick daily stock trading strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  params: { warmupBars: 20, atrPeriod: 14, firstBodyAtr: 0.6, starBodyFraction: 0.3, recoveryFraction: 0.5, targetAtr: 2, holdBars: 10, cooldownBars: 1 },
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

  if (i < 2) return 0;
  const a = bars[i - 2], b = bars[i - 1];
  const body = a.open - a.close;
  const atrA = ctx.atr(14, i - 2);
  const ok = a.close < a.open && atrA > 0 && body >= p.firstBodyAtr * atrA &&
    Math.abs(b.close - b.open) <= p.starBodyFraction * body &&
    b.open < a.close && b.close < a.close &&
    c.close > c.open && c.close > a.close + p.recoveryFraction * body;
  const LOW = Math.min(a.low, b.low, c.low);
  if (!ok) return 0;
  s.pos = 1; s.entry = c.close; s.entryIdx = i; s.entryAtr = atr; s.low = LOW;
  return 1;
}

