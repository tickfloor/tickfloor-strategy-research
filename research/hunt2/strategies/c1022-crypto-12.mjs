export const meta = {
  "id": "c1022-crypto-12",
  "name": "OI-confirmed hourly impulse continuation",
  "family": "momentum",
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
    "ret": 0.015,
    "oiJump": 0.02,
    "hold": 12
  }
};

function oicOf(k, bars, ctx) {
  const oi = ctx.openInterest(k);
  return oi === null ? null : oi / bars[k].close; // coin-denominated OI, null if unknown
}
export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < 1) return 0;
  const cur = oicOf(i, bars, ctx), prev = oicOf(i - 1, bars, ctx);
  if (cur === null || prev === null) return 0;
  const r1 = bars[i].close / bars[i - 1].close - 1;
  const d = cur / prev - 1;
  if (d < p.oiJump) return 0;
  if (r1 >= p.ret) return 1;
  if (r1 <= -p.ret) return -1;
  return 0;
}
