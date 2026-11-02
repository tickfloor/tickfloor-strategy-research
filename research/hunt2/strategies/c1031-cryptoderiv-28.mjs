// Spec: research/hunt2/campaign-1031/prereg-cryptoderiv.json (c1031-cryptoderiv-28). Rule implemented exactly as written there.
export const meta = {
  "id": "c1031-cryptoderiv-28",
  "name": "Fear plus open-interest purge: buy",
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
    "TRXUSDT"
  ],
  "holdBars": 10,
  "params": {
    "fngMax": 30,
    "oiN": 7,
    "oiG": -0.1,
    "hold": 10
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.oiN) return 0;
  const fng = ctx.fearGreed(i);
  const o1 = ctx.openInterest(i), o0 = ctx.openInterest(i - p.oiN);
  if (fng === null || o1 === null || o0 === null) return 0;
  return fng <= p.fngMax && o1 / o0 - 1 <= p.oiG ? 1 : 0;
}
