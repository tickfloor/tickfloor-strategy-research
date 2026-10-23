// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-50). Signal mode, daily ETFs.
// Jacobsen & Visaltanachoti 2009: cyclical sectors held Nov-Apr, defensive sectors held May-Oct.

export const meta = {
  id: "c1022-acad-50",
  name: "Halloween effect by sector: cyclicals Nov-Apr, defensives May-Oct (Jacobsen-Visaltanachoti)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLY", "XLI", "XLB", "XLK", "XLF", "XLE", "XLP", "XLV", "XLU"],
  longShort: false,
  params: {
    cyclicals: ["XLY", "XLI", "XLB", "XLK", "XLF", "XLE"],
    defensives: ["XLP", "XLV", "XLU"],
  },
};

const DAY = 86400;
const WINTER = new Set([11, 12, 1, 2, 3, 4]);

export function signal(bars, i, ctx) {
  // nextSession = next weekday after the bar's UTC date (Fri -> Mon); holidays ignored
  let d = Math.floor(bars[i].time / DAY) + 1;
  while ((d + 4) % 7 === 0 || (d + 4) % 7 === 6) d++;
  const winter = WINTER.has(new Date(d * DAY * 1000).getUTCMonth() + 1);
  const cyclical = ctx.params.cyclicals.includes(ctx.symbol);
  const on = cyclical ? winter : !winter;
  return on ? 1 : 0;
}
