// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-sign-evidence-exit). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-sign-evidence-exit",
  "name": "Does accumulating evidence of bad trade direction improve ETF exits?",
  "family": "sequential-evidence",
  "source": "retail trading content: sequential probability ratio evidence stop loss trade direction",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA",
    "XLK",
    "XLF",
    "XLE",
    "XLV",
    "TLT",
    "GLD"
  ],
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 63,
    "badProcessUpProbability": 0.3,
    "neutralUpProbability": 0.5,
    "evidenceRatio": 10,
    "maxHoldBars": 42
  }
};

export function signal(bars, i, ctx) {
  const p = ctx.params, s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entry = 0; s.ei = -1; }
  if (i < p.warmupBars) return 0;
  const c = bars[i].close;
  if ((i - p.warmupBars) % p.cycleBars === 0) {
    s.pos = 1; s.entry = c; s.ei = i;
    s.L = 0;
    return 1;
  }
  if (s.pos !== 1) return 0;
  const age = i - s.ei;
  const r = c / bars[i - 1].close - 1;
  if (r > 0) s.L += Math.log(p.badProcessUpProbability / p.neutralUpProbability);
  else if (r < 0) s.L += Math.log((1 - p.badProcessUpProbability) / (1 - p.neutralUpProbability));
  const exit = s.L >= Math.log(p.evidenceRatio);
  if (exit || age >= p.maxHoldBars) { s.pos = 0; return 0; }
  return 1;
}
