// c1031-intraday-24: opening 4-hour volume surge vs a 20-day median, continuation held to 20:00 UTC.
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-24",
  name: "Opening-4-hour volume surge continuation",
  family: "momentum",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { openBars: 4, volRatio: 1.5, baselineDays: 20, exitHour: 19 },
};

const hour = (b) => Math.floor(b.time / 3600) % 24;
// True when bars j-n..j are consecutive hourly bars (no gap).
const contig = (bars, j, n) => j >= n && bars[j].time - bars[j - n].time === n * 3600;

const median = (xs) => {
  const s = xs.slice().sort((a, b) => a - b);
  const m = s.length;
  return m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2;
};

export function signal(bars, i, ctx) {
  const { openBars, volRatio, baselineDays, exitHour } = ctx.params;
  if (ctx.state.pos === undefined) { ctx.state.pos = 0; ctx.state.vh = []; }
  const h = hour(bars[i]);
  if (ctx.state.pos !== 0) {
    if (h === exitHour) { ctx.state.pos = 0; return 0; }
    return ctx.state.pos;
  }
  if (h !== 3) return 0; // decision bar: close = 04:00 UTC
  if (!contig(bars, i, openBars - 1)) { ctx.state.vh = []; ctx.state.pos = 0; return 0; }
  let V = 0;
  for (let k = i - openBars + 1; k <= i; k++) V += bars[k].volume;
  const R = bars[i].close / bars[i - openBars + 1].open - 1;
  const vh = ctx.state.vh;
  let dir = 0;
  if (vh.length >= baselineDays) {
    const ratio = V / median(vh); // median of the prior days, before V is pushed
    if (ratio >= volRatio && R > 0) dir = 1;
    else if (ratio >= volRatio && R < 0) dir = -1;
  }
  vh.push(V);
  if (vh.length > baselineDays) vh.shift();
  ctx.state.pos = dir;
  return dir;
}
