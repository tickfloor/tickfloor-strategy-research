// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-crypto-golden-cross",
  name: "Crypto golden cross: long while the 50-day average is above the 200-day average",
  family: "trending-1005",
  source: "Reddit r/CryptoCurrency 1wbu8wb ('Bitcoin Chart Flashes Golden Cross'), Sep 2026",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { fast: 50, slow: 200 },
};

export function signal(bars, i, ctx) {
  const P = ctx.params;
  const f = ctx.sma("close", P.fast), s = ctx.sma("close", P.slow);
  if (!(f === f) || !(s === s)) return 0;
  return f > s ? 1 : 0;
}
