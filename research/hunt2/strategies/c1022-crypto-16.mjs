export const meta = {
  "id": "c1022-crypto-16",
  "name": "Weekend OI build on a flat price, fade on Monday",
  "family": "mean_reversion",
  "source": "c1022/crypto",
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
  "longShort": true,
  "holdBars": 2,
  "params": {
    "oiUp": 0.05,
    "flat": 0.02,
    "hold": 2
  }
};

function oicOf(k, bars, ctx) {
  const oi = ctx.openInterest(k);
  return oi === null ? null : oi / bars[k].close; // coin-denominated OI, null if unknown
}
function dowOf(b) { return (Math.floor(b.time / 86400) + 4) % 7; } // 0=Sun..6=Sat, UTC

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (dowOf(bars[i]) !== 0) return 0;
  let j = i - 1;
  while (j >= 0 && dowOf(bars[j]) !== 5) j--;
  if (j < 0) return 0;
  const cur = oicOf(i, bars, ctx), past = oicOf(j, bars, ctx);
  if (cur === null || past === null) return 0;
  const w = cur / past - 1;
  const r = bars[i].close / bars[j].close - 1;
  return w >= p.oiUp && Math.abs(r) <= p.flat ? -1 : 0;
}
