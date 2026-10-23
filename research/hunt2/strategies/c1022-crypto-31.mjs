// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-31). Frozen before code.
export const meta = {
  id: "c1022-crypto-31",
  name: "Parkinson-vol regime switch on hourly bars: breakout when quiet, fade when loud",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 6,
  params: { pvWin: 24, histWin: 720, lowPct: 0.2, highPct: 0.8, don: 24, fadeWin: 4, fadeRet: 0.02, hold: 6 },
};

export function signal(bars, i, ctx) {
  const { pvWin, histWin, lowPct, highPct, don, fadeWin, fadeRet } = ctx.params;
  const s = ctx.state;
  if (s.pvs === undefined) s.pvs = [];
  if (i < pvWin - 1) return 0;
  let sq = 0;
  for (let k = i - pvWin + 1; k <= i; k++) {
    const l = Math.log(bars[k].high / bars[k].low);
    sq += l * l;
  }
  const pv = Math.sqrt(sq / pvWin);
  s.pvs.push(pv);
  if (s.pvs.length > histWin) s.pvs.shift();
  if (s.pvs.length < histWin) return 0;
  let le = 0;
  for (const v of s.pvs) if (v <= pv) le++;
  const pct = le / histWin;
  const b = bars[i];
  if (pct <= lowPct) {
    const dc = ctx.donchian(don, i - 1);
    if (b.close > dc.upper) return 1;
    if (b.close < dc.lower) return -1;
    return 0;
  }
  if (pct >= highPct) {
    const r = b.close / bars[i - fadeWin].close - 1;
    if (r >= fadeRet) return -1;
    if (r <= -fadeRet) return 1;
  }
  return 0;
}
