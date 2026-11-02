// Spec: research/hunt2/campaign-1031/prereg-cryptoderiv.json (c1031-cryptoderiv-23). Rule implemented exactly as written there.
export const meta = {
  "id": "c1031-cryptoderiv-23",
  "name": "Rising sentiment inside an uptrend: 14-day Fear & Greed improvement",
  "family": "sentiment",
  "source": "c1031/cryptoderiv",
  "assetClass": "crypto",
  "timeframe": "1d",
  "assets": [
    "BTCUSDT",
    "BNBUSDT",
    "XRPUSDT",
    "ADAUSDT",
    "DOGEUSDT",
    "LTCUSDT",
    "LINKUSDT",
    "TRXUSDT",
    "BCHUSDT",
    "ATOMUSDT",
    "ETCUSDT",
    "DASHUSDT",
    "ZECUSDT",
    "AVAXUSDT",
    "UNIUSDT",
    "NEARUSDT",
    "AAVEUSDT",
    "HBARUSDT"
  ],
  "params": {
    "n": 14,
    "dMin": 15,
    "sma": 50
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  const f1 = ctx.fearGreed(i);
  const f0 = i - p.n >= 0 ? ctx.fearGreed(i - p.n) : null;
  if (f1 === null || f0 === null) { ctx.state.pos = 0; return 0; }
  const d = f1 - f0;
  const sma = ctx.sma("close", p.sma, i);
  const c = bars[i].close;
  if (ctx.state.pos === 1) {
    if (d <= 0 || c <= sma) ctx.state.pos = 0;
  } else if (d >= p.dMin && c > sma) {
    ctx.state.pos = 1;
  }
  return ctx.state.pos;
}
