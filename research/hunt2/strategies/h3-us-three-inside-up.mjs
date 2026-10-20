// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-three-inside-up). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-three-inside-up",
  name: "Does a bullish harami with three-inside-up confirmation work?",
  family: "candle-patterns",
  source: "retail trading content: bullish harami three inside up stock strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  params: { warmupBars: 20, atrPeriod: 14, firstBodyAtr: 0.8, insideBodyFraction: 0.5, targetAtr: 2, holdBars: 10, cooldownBars: 1 },
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
    b.close > b.open && b.open > a.close && b.close < a.open &&
    b.close - b.open <= p.insideBodyFraction * body &&
    c.close > c.open && c.close > a.open;
  const LOW = Math.min(a.low, b.low, c.low);
  if (!ok) return 0;
  s.pos = 1; s.entry = c.close; s.entryIdx = i; s.entryAtr = atr; s.low = LOW;
  return 1;
}

