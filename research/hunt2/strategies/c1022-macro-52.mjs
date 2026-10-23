export const meta = {
  "id": "c1022-macro-52",
  "name": "Hourly crypto RSI(14) dip buys only in calm equity vol",
  "family": "mean_reversion",
  "source": "c1022/macro",
  "assetClass": "crypto",
  "timeframe": "1h",
  "params": {
    "rsi": 14,
    "buy": 30,
    "exit": 50,
    "maxHold": 24,
    "vixCap": 25
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Hourly crypto RSI dip buys only in calm equity vol (signal mode). Exit on RSI > exit or after maxHold bars.
export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.pos === undefined) {
    ctx.state.pos = 0;
    ctx.state.entry = 0;
  }
  const r = ctx.rsi(p.rsi, i);
  if (ctx.state.pos === 0) {
    const v = ctx.macro("VIX", i);
    if (r < p.buy && v !== null && v < p.vixCap) {
      ctx.state.pos = 1;
      ctx.state.entry = i;
    }
  } else if (r > p.exit || i - ctx.state.entry >= p.maxHold) {
    ctx.state.pos = 0;
  }
  return ctx.state.pos;
}
