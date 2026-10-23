export const meta = {
  "id": "c1022-macro-51",
  "name": "Crypto long for 20 days after a sharp weekly dollar drop",
  "family": "macro",
  "source": "c1022/macro",
  "assetClass": "crypto",
  "timeframe": "1d",
  "holdBars": 20,
  "params": {
    "lookback": 7,
    "drop": -0.015,
    "hold": 20
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Crypto long (holdBars 20) after a sharp 7-bar weekly-style dollar drop (signal mode). Null -> 0.
export function signal(bars, i, ctx) {
  const p = ctx.params;
  const cur = ctx.macro("DTWEXBGS", i);
  const past = i - p.lookback < 0 ? null : ctx.macro("DTWEXBGS", i - p.lookback);
  if (cur == null || past == null || past === 0) return 0;
  return cur / past - 1 <= p.drop ? 1 : 0;
}
