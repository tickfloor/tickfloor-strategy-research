// c1022 acad chunk 3. Cooper, McConnell & Ovtchinnikov 2006, JFE 82(2), 315-341; Stivers, Sun & Sun 2009, JFM 12(3).
// SPY is holdout -> INDEX_PROXY rule: trade QQQ (and DIA) instead.
export const meta = {
  id: "c1022-acad-49",
  name: "January barometer per sector: hold each sector/index ETF Feb-Dec only if its own January return was positive",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"], // same set as the spec; QQQ first so the 6-asset lint slice holds the proxy
  proxyFor: { SPY: "QQQ" },
  params: {},
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }
function nextSession(t) {
  let s = (Math.floor(t / DAY) + 1) * DAY;
  while (dowOf(s) === 0 || dowOf(s) === 6) s += DAY;
  return s;
}
function monthOf(t) { return new Date(t * 1000).getUTCMonth() + 1; }

// ctx.state is per asset (ctx is built per symbol), so decClose and jan are per ETF.
export function signal(bars, i, ctx) {
  const t = bars[i].time;
  const mo = monthOf(t);
  const nsMonth = monthOf(nextSession(t));
  if (mo === 12) ctx.state.decClose = bars[i].close;
  // last January bar (next session is in February): this January's barometer
  if (mo === 1 && nsMonth === 2) {
    ctx.state.jan = ctx.state.decClose !== undefined && bars[i].close / ctx.state.decClose - 1 > 0;
  }
  if (nsMonth === 1) return 1; // January is always held
  return ctx.state.jan === true ? 1 : 0;
}
