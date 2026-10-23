// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-52). Signal mode, daily ETFs.
// SPY is holdout: swapped for QQQ via proxyFor (INDEX_PROXY rule).

export const meta = {
  id: "c1022-acad-52",
  name: "Index-level overnight-return momentum: long QQQ/DIA while the trailing 20-day overnight return is positive",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  longShort: false,
  params: { bars: 20 },
};

export function signal(bars, i, ctx) {
  const n = ctx.params.bars;
  if (i < n) return 0; // needs n+1 bars (prereg: 0 before 21 bars)
  let on = 0;
  for (let k = i - n + 1; k <= i; k++) on += Math.log(bars[k].open / bars[k - 1].close);
  return on > 0 ? 1 : 0;
}
