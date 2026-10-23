// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-63). Frozen before code.
export const meta = {
  id: "c1022-crypto-63",
  name: "Stealth breakout: 20-day high on below-median volume",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  holdBars: 10,
  params: { don: 20, volWin: 20, hold: 10 },
};

// Long iff close > prior `don`-bar Donchian upper AND volume[i] < median volume of bars i-volWin..i-1.
export function signal(bars, i, ctx) {
  const { don, volWin } = ctx.params;
  if (i < volWin) return 0;
  const dc = ctx.donchian(don, i - 1);
  if (!(bars[i].close > dc.upper)) return 0;
  const vs = [];
  for (let k = i - volWin; k <= i - 1; k++) vs.push(bars[k].volume);
  vs.sort((a, b) => a - b);
  const m = vs.length;
  const med = m % 2 ? vs[(m - 1) / 2] : (vs[m / 2 - 1] + vs[m / 2]) / 2;
  return bars[i].volume < med ? 1 : 0;
}
