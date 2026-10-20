// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-mcginley-dynamic). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-mcginley-dynamic",
  "name": "Does the McGinley Dynamic work on crypto?",
  "family": "indicator-mcginley",
  "source": "retail trading content: McGinley Dynamic 20 period crypto trading strategy",
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
    "period": 20,
    "speedConstant": 0.6,
    "ratioExponent": 4,
    "warmupBars": 100,
    "minDenominator": 1
  }
};

export function signal(bars, i, ctx) {
  if (i < 19) return 0;
  const s = ctx.state;
  const c = bars[i].close;
  if (i === 19) {
    if (s.md === undefined) s.md = ctx.sma("close", 20, 19);
    return 0;
  }
  const old = s.md;
  if (!(Number.isFinite(c) && c > 0 && Number.isFinite(old) && old > 0)) {
    const r = ctx.sma("close", 20, i);
    s.md = Number.isFinite(r) && r > 0 ? r : undefined;
    return 0;
  }
  const den = Math.max(1, 0.6 * 20 * Math.pow(c / old, 4));
  s.md = old + (c - old) / den;
  if (i < 100) return 0;
  return c > s.md && s.md > old ? 1 : 0;
}

