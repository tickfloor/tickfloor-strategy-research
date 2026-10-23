// Spec: campaign-1022/prereg-macro.json c1022-macro-57 (signal, long-short).
// Long-short index by VIX curve and 200d trend agreement. Source: Moskowitz-Ooi-Pedersen (2012); Simon & Campasano (2014).

export const meta = {
  id: "c1022-macro-57",
  name: "Long-short index by VIX curve and 200d trend agreement",
  family: "trend",
  source: "c1022/macro",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  proxyFor: { SPY: "QQQ" },
  longShort: true,
  params: { sma: 200 },
};

export function signal(bars, i, ctx) {
  const sma = ctx.sma("close", ctx.params.sma, i);
  if (Number.isNaN(sma)) return 0;
  const up = bars[i].close > sma;
  const vix3m = ctx.macro("VIX3M", i);
  // PREREG FIX: null VIX3M returns 1 (benchmark-neutral long).
  if (vix3m == null) return 1;
  const vix = ctx.macro("VIX", i);
  if (vix == null) return 0;
  const contango = vix < vix3m;
  if (up && contango) return 1;
  if (!up && !contango) return -1;
  return 0;
}
