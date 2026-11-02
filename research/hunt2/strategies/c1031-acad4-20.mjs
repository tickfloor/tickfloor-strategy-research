// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-20). Late-October deep-drawdown entry, 8-bar hold, wide US stock universe
export const meta = {
  id: "c1031-acad4-20",
  name: "Late-October oversold entry: buy on the first bar from 28 Oct when 250-bar return is -20% or worse, 8-bar hold",
  family: "seasonality",
  source: "c1031/acad4",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  longShort: false,
  holdBars: 8,
  params: { cutoff: -0.2, lookback: 250, hold: 8, entryMonthDay: "10-28" },
};

const dayKey = (t) => {
  const d = new Date(t * 1000);
  return d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (i < p.lookback) return 0;
  const [mm, dd] = p.entryMonthDay.split("-").map(Number);
  const cur = dayKey(bars[i].time);
  const prev = dayKey(bars[i - 1].time);
  const yr = Math.floor(cur / 10000);
  let entry = false;
  for (let Y = yr - 1; Y <= yr; Y++) {
    const cut = Y * 10000 + mm * 100 + dd;
    if (cur >= cut && prev < cut) entry = true;
  }
  if (!entry) return 0;
  return bars[i].close / bars[i - p.lookback].close - 1 <= p.cutoff ? 1 : 0;
}
