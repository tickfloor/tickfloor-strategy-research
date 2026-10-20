// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-bmsb-c",
  name: "Bull Market Support Band: long while close above both the 20-week SMA and 21-week EMA (140d SMA / 147d EMA proxy), crypto 1d x18",
  family: "tests-1010",
  source: "YouTube/Twitter 'bull market support band' (Bitcoin 20w SMA + 21w EMA)",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { sma: 140, ema: 147 },
  warmup: 147,
};
export function signal(bars, i, ctx) {
  const P = ctx.params, c = bars[i].close;
  const s = ctx.sma("close", P.sma), e = ctx.ema("close", P.ema);
  return c > s && c > e ? 1 : 0;
}
