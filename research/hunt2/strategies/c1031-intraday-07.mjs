// c1031-intraday-07: Monday-morning move (00:00-12:00 UTC) sets the week's direction.
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-07",
  name: "Monday-morning move sets the week's direction",
  family: "momentum",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { mondayBars: 12, zEntry: 1.0, exitDow: 5, exitHour: 20, volWindow: 720 },
};

const hour = (b) => Math.floor(b.time / 3600) % 24;
const dow = (b) => (Math.floor(b.time / 86400) + 4) % 7; // 0=Sun..6=Sat
// True when bars j-n..j are consecutive hourly bars (no gap).
const contig = (bars, j, n) => j >= n && bars[j].time - bars[j - n].time === n * 3600;

export function signal(bars, i, ctx) {
  const { mondayBars: n, zEntry, exitDow, exitHour, volWindow } = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  if (ctx.state.pos !== 0) {
    if (dow(bars[i]) === exitDow && hour(bars[i]) === exitHour) { ctx.state.pos = 0; return 0; }
    return ctx.state.pos;
  }
  if (dow(bars[i]) !== 1 || hour(bars[i]) !== 11) return 0; // Monday 12:00 close only
  const s = i - n; // sigma at the bar before the move starts
  if (!contig(bars, i, n) || !contig(bars, s, volWindow)) return 0;
  const sig = ctx.rollingStd("ret", volWindow, s);
  if (!(sig > 0)) return 0;
  const R = bars[i].close / bars[i - n + 1].open - 1;
  const z = R / (sig * Math.sqrt(n));
  let dir = 0;
  if (z >= zEntry) dir = 1;
  else if (z <= -zEntry) dir = -1;
  ctx.state.pos = dir;
  return dir;
}
