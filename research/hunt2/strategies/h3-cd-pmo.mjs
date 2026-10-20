// Spec: docs/research/hunt-1003/codex/specs.json (h3-cd-pmo). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  "id": "h3-cd-pmo",
  "name": "Does the Price Momentum Oscillator work on crypto?",
  "family": "indicator-pmo",
  "source": "retail trading content: DecisionPoint Price Momentum Oscillator PMO crypto strategy",
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
    "firstPeriod": 35,
    "secondPeriod": 20,
    "signalPeriod": 10,
    "warmupBars": 100
  }
};

export function signal(bars, i, ctx) {
  if (i < 1) return 0;
  const s = ctx.state;
  const r = 100 * (bars[i].close / bars[i - 1].close - 1);
  if (s.first === undefined) {
    s.first = r;
    s.pmo = 10 * r;
    s.trigger = s.pmo;
  } else {
    s.first = s.first + (2 / 35) * (r - s.first);
    s.pmo = s.pmo + (2 / 20) * (10 * s.first - s.pmo);
    s.trigger = s.trigger + (2 / 11) * (s.pmo - s.trigger);
  }
  if (i < 100) return 0;
  return s.pmo > s.trigger && s.pmo > 0 ? 1 : 0;
}

