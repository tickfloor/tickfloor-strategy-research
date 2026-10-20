// Spec: docs/research/hunt-1004/codex/specs.json (h4-us-loss-block-confirmation). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-us-loss-block-confirmation",
  "name": "Does waiting for three losing blocks improve stock exits?",
  "family": "path-order",
  "source": "retail trading content: three consecutive losing return blocks trade exit confirmation",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "warmupBars": 64,
    "cycleBars": 63,
    "blockBars": 5,
    "losingBlocksToExit": 3,
    "maxHoldBars": 42
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, S = ctx.state;
  if (S.pos === undefined) { S.pos = 0; S.entryIdx = -1; S.blockAnchor = 0; S.losingStreak = 0; }
  if (i < P.warmupBars) return 0;
  if (S.pos === 1) {
    const age = i - S.entryIdx;
    if (age % P.blockBars === 0) {
      S.losingStreak = bars[i].close < S.blockAnchor ? S.losingStreak + 1 : 0;
      S.blockAnchor = bars[i].close;
    }
    if (S.losingStreak >= P.losingBlocksToExit || age >= P.maxHoldBars) S.pos = 0;
    return S.pos;
  }
  if ((i - P.warmupBars) % P.cycleBars === 0) {
    S.pos = 1; S.entryIdx = i; S.blockAnchor = bars[i].close; S.losingStreak = 0;
    return 1;
  }
  return 0;
}
