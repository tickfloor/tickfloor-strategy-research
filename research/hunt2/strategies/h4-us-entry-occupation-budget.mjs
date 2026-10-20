// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-entry-occupation-budget). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-entry-occupation-budget",
  "name": "Does limiting time below a stock entry improve exits?",
  "family": "anchor-occupation",
  "source": "retail trading content: time spent below entry price occupation budget trade exit",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 21,
    "minAgeBars": 8,
    "maxBelowFraction": 0.75,
    "maxHoldBars": 20
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, S = ctx.state;
  if (S.pos === undefined) { S.pos = 0; S.entryClose = 0; S.entryIdx = -1; S.below = 0; }
  if (i < P.warmupBars) return 0;
  if (S.pos === 1) {
    const age = i - S.entryIdx;
    if (bars[i].close < S.entryClose) S.below++;
    if ((age >= P.minAgeBars && S.below / age >= P.maxBelowFraction) || age >= P.maxHoldBars) S.pos = 0;
    return S.pos;
  }
  if ((i - P.warmupBars) % P.cycleBars === 0) {
    S.pos = 1; S.entryClose = bars[i].close; S.entryIdx = i; S.below = 0;
    return 1;
  }
  return 0;
}
