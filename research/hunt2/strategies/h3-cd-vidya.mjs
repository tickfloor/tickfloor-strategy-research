// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-vidya). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-vidya",
  "name": "Does the VIDYA adaptive moving average work on crypto?",
  "family": "indicator-vidya",
  "source": "retail trading content: VIDYA Chande momentum adaptive moving average crypto strategy",
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
  "longShort": false,
  "params": {
    "cmoPeriod": 9,
    "averagePeriod": 20,
    "warmupBars": 100
  }
};

export function signal(bars, i, ctx) {
  if (i < 9) return 0;
  const s = ctx.state;
  const c = bars[i].close;
  if (i === 9) {
    if (s.vidya === undefined) s.vidya = c;
    return 0;
  }
  let U = 0, D = 0;
  for (let k = i - 8; k <= i; k++) {
    const d = bars[k].close - bars[k - 1].close;
    if (d > 0) U += d; else D -= d;
  }
  const cmo = U + D === 0 ? 0 : (U - D) / (U + D);
  const old = s.vidya;
  s.vidya = old + (2 / 21) * Math.abs(cmo) * (c - old);
  if (i < 100) return 0;
  return c > s.vidya && s.vidya > old ? 1 : 0;
}

