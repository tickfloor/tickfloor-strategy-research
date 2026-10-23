export const meta = {
  "id": "c1022-crypto-13",
  "name": "Short-squeeze exhaustion: price up on falling OI, fade it",
  "family": "mean_reversion",
  "source": "c1022/crypto",
  "assetClass": "crypto",
  "timeframe": "1h",
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
  "longShort": true,
  "holdBars": 12,
  "params": {
    "win": 4,
    "ret": 0.02,
    "oiDrop": -0.02,
    "hold": 12
  }
};

function oicOf(k, bars, ctx) {
  const oi = ctx.openInterest(k);
  return oi === null ? null : oi / bars[k].close; // coin-denominated OI, null if unknown
}
export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.win) return 0;
  const cur = oicOf(i, bars, ctx), past = oicOf(i - p.win, bars, ctx);
  if (cur === null || past === null) return 0;
  const r = bars[i].close / bars[i - p.win].close - 1;
  const d = cur / past - 1;
  return r >= p.ret && d <= p.oiDrop ? -1 : 0;
}
