// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-crypto-200dma-30d",
  name: "Crypto bull regime: long after 30 straight closes above the 200-day average, out on the first close below",
  family: "trending-1005",
  source: "Reddit r/CryptoCurrency 1woxcq1 ('closes above its 200 Day Moving Average for at least 30 days')",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { sma: 200, daysAbove: 30 },
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state;
  if (s.run === undefined) { s.run = 0; s.on = false; }
  const m = ctx.sma("close", P.sma);
  if (!(m === m)) return 0;
  if (bars[i].close > m) s.run++; else { s.run = 0; s.on = false; }
  if (s.run >= P.daysAbove) s.on = true;
  return s.on ? 1 : 0;
}
