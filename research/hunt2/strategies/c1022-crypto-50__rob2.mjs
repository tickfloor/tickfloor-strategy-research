// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-50). Signal mode, long-only.

export const meta = {
  id: "c1022-crypto-50__rob2",
  name: "VIX-level gate on a crypto trend (+25%)",
  family: "other",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  params: { vix: 30, sma: 63 },
};

export function signal(bars, i, ctx) {
  const { vix, sma } = ctx.params;
  if (i < sma - 1) return 0;
  const v = ctx.macro("VIX", i);
  const level = v === null ? 20 : v;
  const trend = ctx.sma("close", sma, i);
  return bars[i].close > trend && level < vix ? 1 : 0;
}
