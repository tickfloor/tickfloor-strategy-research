// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-23). Savor & Wilson 2016, Journal of Finance 71(1), 83-138
export const meta = {
  id: "c1031-acad4-23",
  name: "Earnings-season market premium: hold equity ETFs from the 15th of Jan/Apr/Jul/Oct to the 14th of the next month (Savor-Wilson)",
  family: "seasonality",
  source: "c1031/acad4",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  longShort: false,
  params: { seasonStartDay: 15 },
};

const START_MONTHS = [1, 4, 7, 10];
const END_MONTHS = [2, 5, 8, 11];

export function signal(bars, i, ctx) {
  const p = ctx.params;
  // the calendar day after bar i's session, UTC
  const d = new Date((bars[i].time + 86400) * 1000);
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  const inStart = START_MONTHS.includes(m) && day >= p.seasonStartDay;
  const inEnd = END_MONTHS.includes(m) && day < p.seasonStartDay;
  return inStart || inEnd ? 1 : 0;
}
