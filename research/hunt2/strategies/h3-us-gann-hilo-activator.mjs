// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-gann-hilo-activator). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-gann-hilo-activator",
  name: "Does the Gann HiLo Activator work on daily stocks?",
  family: "indicator-gann-hilo",
  source: "retail trading content: Gann HiLo Activator three day stock trend strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  params: { warmupBars: 4, activatorBars: 3 },
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  const c = bars[i];
  if (i + 1 < ctx.params.warmupBars) return 0;
  const U = ctx.sma("high", 3, i - 1), D = ctx.sma("low", 3, i - 1);
  if (![c.open, c.high, c.low, c.close, U, D].every(Number.isFinite)) { s.pos = 0; return 0; }
  if (c.close > U) s.pos = 1;
  else if (c.close < D) s.pos = 0;
  return s.pos;
}
