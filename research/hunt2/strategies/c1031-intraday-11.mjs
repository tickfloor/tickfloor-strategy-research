// c1031-intraday-11: Bollinger reversion in the quiet Asia hours (02:00-05:00 UTC entries, exit by 07:00).
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-11",
  name: "Quiet-hours Bollinger reversion in the Asia session",
  family: "mean_reversion",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { smaBars: 24, k: 2.0, entryHours: [2, 3, 4, 5], exitHour: 7 },
};

const hour = (b) => Math.floor(b.time / 3600) % 24;
// True when bars j-n..j are consecutive hourly bars (no gap).
const contig = (bars, j, n) => j >= n && bars[j].time - bars[j - n].time === n * 3600;

export function signal(bars, i, ctx) {
  const { smaBars, k, entryHours, exitHour } = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  if (!contig(bars, i, smaBars - 1)) { ctx.state.pos = 0; return 0; }
  const c = bars[i].close;
  const h = hour(bars[i]);
  const m = ctx.sma("close", smaBars, i);
  const s = ctx.rollingStd("close", smaBars, i);
  if (ctx.state.pos !== 0) {
    if (h === exitHour || (ctx.state.pos === 1 && c >= m) || (ctx.state.pos === -1 && c <= m)) {
      ctx.state.pos = 0;
    }
    return ctx.state.pos;
  }
  if (!entryHours.includes(h)) return 0;
  if (c < m - k * s) ctx.state.pos = 1;
  else if (c > m + k * s) ctx.state.pos = -1;
  return ctx.state.pos;
}
