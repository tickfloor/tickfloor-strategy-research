// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-03). Campbell, Grossman & Wang 1993, QJE 108(4), 905-939 (applied to hourly crypto bars)
export const meta = {
  id: "c1031-acad4-03",
  name: "Volume-conditioned hourly autocorrelation in crypto: fade high-volume 1.5-sigma hours, follow low-volume ones (Campbell-Grossman-Wang transfer)",
  family: "mean_reversion",
  source: "c1031/acad4",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { volWin: 24, sigmaWin: 168, k: 1.5 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.sigmaWin + 1) return 0;
  const r = bars[i].close / bars[i - 1].close - 1;
  const sig = ctx.rollingStd("ret", p.sigmaWin, i);
  const vbar = ctx.rollingMean("volume", p.volWin, i - 1);
  if (!(vbar > 0) || !(Math.abs(r) >= p.k * sig)) return 0;
  const sgn = Math.sign(r);
  return bars[i].volume / vbar > 1 ? -sgn : sgn;
}
