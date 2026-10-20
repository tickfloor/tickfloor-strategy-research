// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-bbrsi-c",
  "name": "Bollinger + RSI double: buy close under lower band with RSI<30, sell over upper band or RSI>70 (crypto 1d x18)",
  "family": "top100-1006",
  "source": "TradingView 'Bollinger + RSI, Double Strategy' (ChartArt) 38.1K likes",
  "assetClass": "crypto",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "n": 20,
    "k": 2,
    "rsi": 14,
    "lo": 30,
    "hi": 70
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const mu = ctx.sma("close", P.n), sd = ctx.rollingStd("close", P.n), r = ctx.rsi(P.rsi);
  if (!(mu === mu) || !(sd === sd) || !(r === r)) return 0;
  if (s.pos === undefined) s.pos = 0;
  const c = b.close;
  if (s.pos === 0 && c < mu - P.k * sd && r < P.lo) s.pos = 1;
  else if (s.pos === 1 && (c > mu + P.k * sd || r > P.hi)) s.pos = 0;
  return s.pos;
}
