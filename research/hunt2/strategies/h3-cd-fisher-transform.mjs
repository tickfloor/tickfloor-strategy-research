// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-fisher-transform). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-fisher-transform",
  "name": "Does the Fisher Transform indicator work on crypto?",
  "family": "indicator-fisher",
  "source": "retail trading content: Ehlers Fisher Transform nine period crypto strategy",
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
    "lookback": 9,
    "inputWeight": 0.33,
    "memoryWeight": 0.67,
    "fisherMemory": 0.5,
    "inputClamp": 0.999,
    "warmupBars": 50
  }
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.x === undefined) { s.x = 0; s.fisher = 0; }
  if (i < 8) return 0;
  let L = Infinity, H = -Infinity;
  for (let k = i - 8; k <= i; k++) {
    const m = (bars[k].high + bars[k].low) / 2;
    if (m < L) L = m;
    if (m > H) H = m;
  }
  const p = (bars[i].high + bars[i].low) / 2;
  const z = H === L ? 0.5 : (p - L) / (H - L);
  s.x = Math.min(0.999, Math.max(-0.999, 0.66 * z - 0.33 + 0.67 * s.x));
  const oldF = s.fisher;
  s.fisher = 0.5 * Math.log((1 + s.x) / (1 - s.x)) + 0.5 * oldF;
  if (i < 50) return 0;
  return s.fisher > 0 && s.fisher > oldF ? 1 : 0;
}

