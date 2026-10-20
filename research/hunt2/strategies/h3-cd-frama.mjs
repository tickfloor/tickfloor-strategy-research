// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-frama). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-frama",
  "name": "Does the FRAMA adaptive moving average work on crypto?",
  "family": "indicator-frama",
  "source": "retail trading content: Ehlers FRAMA fractal adaptive moving average crypto strategy",
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
    "window": 16,
    "halfWindow": 8,
    "exponent": 4.6,
    "minAlpha": 0.01,
    "maxAlpha": 1,
    "warmupBars": 100
  }
};

export function signal(bars, i, ctx) {
  if (i < 15) return 0;
  const s = ctx.state;
  const c = bars[i].close;
  if (i === 15) {
    if (s.frama === undefined) s.frama = ctx.sma("close", 16, 15);
    return 0;
  }
  const d8 = ctx.donchian(8, i), d8b = ctx.donchian(8, i - 8), d16 = ctx.donchian(16, i);
  const N1 = (d8.upper - d8.lower) / 8;
  const N2 = (d8b.upper - d8b.lower) / 8;
  const N3 = (d16.upper - d16.lower) / 16;
  const dim = N1 + N2 > 0 && N3 > 0 ? Math.log((N1 + N2) / N3) / Math.log(2) : 2;
  const alpha = Math.min(1, Math.max(0.01, Math.exp(-4.6 * (dim - 1))));
  const old = s.frama;
  s.frama = alpha * c + (1 - alpha) * old;
  if (i < 100) return 0;
  return s.frama > old && c >= s.frama ? 1 : 0;
}

