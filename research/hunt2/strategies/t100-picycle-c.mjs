// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-picycle-c",
  "name": "Pi Cycle Top: flat while the 111-day average is above twice the 350-day average, long otherwise (crypto 1d x18)",
  "family": "top100-1006",
  "source": "Pi Cycle Top indicator (bitcoin chart staple, widely posted on TradingView and r/Bitcoin)",
  "assetClass": "crypto",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "fast": 111,
    "slow": 350,
    "mult": 2
  },
  "warmup": 349
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const a = ctx.sma("close", P.fast), c = ctx.sma("close", P.slow);
  if (!(a === a) || !(c === c)) return 0;
  return a < P.mult * c ? 1 : 0;
}
