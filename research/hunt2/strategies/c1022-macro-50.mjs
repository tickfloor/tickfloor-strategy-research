export const meta = {
  "id": "c1022-macro-50",
  "name": "Crypto stand-down after a 5-day real-yield jump",
  "family": "macro",
  "source": "c1022/macro",
  "assetClass": "crypto",
  "timeframe": "1d",
  "params": {
    "lookback": 5,
    "bp": 0.25,
    "standDown": 10
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Crypto stand-down: a 5-bar real-yield jump >= bp sets off = i + standDown; flat while i < off (signal mode).
function chg(ctx, id, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro(id, i);
  const b = ctx.macro(id, i - n);
  if (a == null || b == null) return null;
  return a - b;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.off === undefined) ctx.state.off = -1;
  const d = chg(ctx, "DFII10", i, p.lookback);
  if (d !== null && d >= p.bp) ctx.state.off = i + p.standDown;
  return i < ctx.state.off ? 0 : 1;
}
