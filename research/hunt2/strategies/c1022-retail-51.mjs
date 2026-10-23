// Campaign c1022 chunk 4 (retail). Rule from campaign-1022/prereg-retail.json.
export const meta = {
  "id": "c1022-retail-51",
  "name": "VSA stopping volume (ultra-high volume down bar closing in the upper half)",
  "family": "mean_reversion",
  "source": "c1022/retail",
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
    "volMult": 2,
    "volAvg": 20,
    "closeLoc": 0.5,
    "lowLookback": 20,
    "maxHold": 10
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entryBar = -1; st.entryLow = NaN; }
  const b = bars[i];
  // ponytail: spec says "close < low[i]" which is always false on the current bar; the exit uses the entry bar's low (the stopping-volume low).
  if (st.pos === 1) {
    if (i - st.entryBar >= p.maxHold || b.close < st.entryLow) st.pos = 0;
    return st.pos;
  }
  if (i < 1 || i < p.lowLookback) return 0;
  const prev = bars[i - 1];
  const range = b.high - b.low;
  if (!(b.close < prev.close)) return 0;
  if (!(b.volume > p.volMult * ctx.sma("volume", p.volAvg, i))) return 0;
  if (!(range > 0 && (b.close - b.low) / range >= p.closeLoc)) return 0;
  let minLow = Infinity;
  for (let k = i - p.lowLookback; k <= i - 1; k++) if (bars[k].low < minLow) minLow = bars[k].low;
  if (!(b.low <= minLow)) return 0;
  st.pos = 1; st.entryBar = i; st.entryLow = b.low;
  return 1;
}
