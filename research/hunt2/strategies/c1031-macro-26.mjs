// c1031 round-4 macro spec c1031-macro-26 (frozen in campaign-1031/prereg-macro.json).
// Source: Connors & Alvarez (2009) Short Term Trading Strategies That Work; Nagel (2012) RFS 25(7)

export const meta = {
  "id": "c1031-macro-26",
  "name": "RSI(2) pullbacks on 40 large caps, allowed only while VIX sits between 15 and 30",
  "family": "mean_reversion",
  "source": "c1031/macro",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "assets": [
    "AAPL",
    "NVDA",
    "AMZN",
    "GOOGL",
    "META",
    "TSLA",
    "JPM",
    "V",
    "UNH",
    "XOM",
    "JNJ",
    "COST",
    "ABBV",
    "MRK",
    "AVGO",
    "CVX",
    "WMT",
    "BAC",
    "ORCL",
    "ADBE",
    "CRM",
    "NFLX",
    "AMD",
    "INTC",
    "ABT",
    "MCD",
    "DIS",
    "QCOM",
    "TXN",
    "HON",
    "CAT",
    "LOW",
    "SBUX",
    "BA",
    "UPS",
    "PFE",
    "T",
    "MDT",
    "UNP",
    "MMM"
  ],
  "params": {
    "rsiN": 2,
    "rsiMax": 10,
    "trendSma": 200,
    "exitSma": 5,
    "vixLo": 15,
    "vixHi": 30
  }
};

export function signal(bars, i, ctx) {
  const { rsiN, rsiMax, trendSma, exitSma, vixLo, vixHi } = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  const V = ctx.macro("VIXCLS", i);
  if (V === null) return 0;
  const c = bars[i].close;
  // Rule is applied in written order: entry check, then exit check on the same bar.
  if (ctx.state.pos === 0 && c > ctx.sma("close", trendSma, i) && ctx.rsi(rsiN, i) < rsiMax && V >= vixLo && V <= vixHi) ctx.state.pos = 1;
  if (ctx.state.pos === 1 && c > ctx.sma("close", exitSma, i)) ctx.state.pos = 0;
  return ctx.state.pos;
}
