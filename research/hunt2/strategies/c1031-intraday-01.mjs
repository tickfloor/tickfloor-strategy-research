// c1031-intraday-01: US-session extreme move (14:00-21:00 UTC) reversed into the Asia session.
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-01",
  name: "US-session extreme move reversed into the Asia session",
  family: "mean_reversion",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { sessionBars: 7, zEntry: 2.0, holdBars: 8, volWindow: 720 },
};

const hour = (b) => Math.floor(b.time / 3600) % 24;
// True when bars j-n..j are consecutive hourly bars (no gap).
const contig = (bars, j, n) => j >= n && bars[j].time - bars[j - n].time === n * 3600;

export function signal(bars, i, ctx) {
  const { sessionBars: n, zEntry, holdBars, volWindow } = ctx.params;
  if (ctx.state.pos === undefined) { ctx.state.pos = 0; ctx.state.entry = 0; }
  if (ctx.state.pos !== 0) {
    if (i - ctx.state.entry >= holdBars) { ctx.state.pos = 0; return 0; }
    return ctx.state.pos;
  }
  if (hour(bars[i]) !== 20) return 0;
  const s = i - n; // sigma is taken at the bar before the move starts
  if (!contig(bars, i, n) || !contig(bars, s, volWindow)) return 0;
  const sig = ctx.rollingStd("ret", volWindow, s);
  if (!(sig > 0)) return 0;
  const R = bars[i].close / bars[i - n + 1].open - 1;
  const z = R / (sig * Math.sqrt(n));
  let dir = 0;
  if (z <= -zEntry) dir = 1;
  else if (z >= zEntry) dir = -1;
  if (dir !== 0) { ctx.state.pos = dir; ctx.state.entry = i; }
  return dir;
}
