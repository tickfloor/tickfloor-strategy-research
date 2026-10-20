// trending-1005 amendment (2026-10-06, lane z1). Pre-registered in docs/research/trending-1005/prereg-amendment-2026-10-06.md before any run.
// Same rule as tr5-crypto-golden-cross; meta.warmup scores the rule AND the benchmark only from bar 199 of each coin, the first bar
// its 200-day average exists, so the comparison is not charged for history the rule could not see.
export const meta = {
  id: "tr5a-crypto-golden-cross-matched",
  name: "Crypto golden cross: long while the 50-day average is above the 200-day average (scored from the first bar its 200-day average exists)",
  family: "trending-1005",
  source: "Reddit r/CryptoCurrency 1wbu8wb ('Bitcoin Chart Flashes Golden Cross'), Sep 2026",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  warmup: 199,
  params: { fast: 50, slow: 200 },
};

export function signal(bars, i, ctx) {
  const P = ctx.params;
  const f = ctx.sma("close", P.fast), s = ctx.sma("close", P.slow);
  if (!(f === f) || !(s === s)) return 0;
  return f > s ? 1 : 0;
}
