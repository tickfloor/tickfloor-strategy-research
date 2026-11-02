// Spec: research/hunt2/campaign-1031/prereg-overlay.json (c1031-overlay-28). Cont 2001, Quantitative Finance 1(2); Andersen et al. 2003, Econometrica 71(2)
export const meta = {
  id: "c1031-overlay-28",
  name: "Hourly crypto flash-crash brake: flat for 24 hours after a close 8% below the 48-hour closing high",
  family: "stop-exit",
  source: "c1031/overlay",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: false,
  params: { lookbackBars: 48, dropFrac: 0.92, standDownBars: 24 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < 80) return 0;
  for (let k = i - p.standDownBars + 1; k <= i; k++) {
    let hi = -Infinity;
    for (let j = k - p.lookbackBars; j <= k - 1; j++) if (bars[j].close > hi) hi = bars[j].close;
    if (bars[k].close <= p.dropFrac * hi) return 0;
  }
  return 1;
}
