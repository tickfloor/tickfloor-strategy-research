// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-choppiness-release). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-choppiness-release",
  "name": "Does leaving a choppy market identify a crypto trend?",
  "family": "indicator-choppiness",
  "source": "retail trading content: Choppiness Index 61.8 release crypto trend strategy",
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
    "lookback": 14,
    "choppyLevel": 61.8,
    "maxHoldBars": 30,
    "warmupBars": 30
  }
};

export function signal(bars, i, ctx) {
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entryIndex = -1; }
  if (i < 14) return 0;
  let T = 0;
  for (let k = i - 13; k <= i; k++) {
    const pc = bars[k - 1].close;
    T += Math.max(bars[k].high - bars[k].low, Math.abs(bars[k].high - pc), Math.abs(bars[k].low - pc));
  }
  const d = ctx.donchian(14, i);
  const R = d.upper - d.lower;
  const chop = R <= 0 || T <= 0 ? 100 : 100 * Math.log(T / R) / Math.log(14);
  const prev = s.chop;
  s.chop = chop;
  if (i < 30) return 0;
  if (s.pos === 1) {
    if (chop >= 61.8 || i - s.entryIndex >= 30) { s.pos = 0; return 0; }
    return 1;
  }
  if (prev !== undefined && prev >= 61.8 && chop < 61.8 && bars[i].close > bars[i - 14].close) {
    s.pos = 1; s.entryIndex = i;
  }
  return s.pos;
}

