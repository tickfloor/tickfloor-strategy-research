// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-ema2050-c",
  "name": "EMA 20 above EMA 50, long only (crypto 1d x18)",
  "family": "top100-1006",
  "source": "YouTube/Reddit moving-average crossover content; TradingView built-in EMA; r/Daytrading EMA threads",
  "assetClass": "crypto",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "fast": 20,
    "slow": 50
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const f = ctx.ema("close", P.fast), sl = ctx.ema("close", P.slow);
  if (!(f === f) || !(sl === sl)) return 0;
  return f > sl ? 1 : 0;
}
