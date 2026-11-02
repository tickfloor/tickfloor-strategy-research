// c1031-intraday-21: six consecutive hourly closes in one direction, faded for six bars.
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-21",
  name: "Six consecutive hourly closes in one direction: fade",
  family: "mean_reversion",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { streak: 6, holdBars: 6 },
};

// True when bars j-n..j are consecutive hourly bars (no gap).
const contig = (bars, j, n) => j >= n && bars[j].time - bars[j - n].time === n * 3600;

export function signal(bars, i, ctx) {
  const { streak, holdBars } = ctx.params;
  if (ctx.state.pos === undefined) { ctx.state.pos = 0; ctx.state.entry = 0; }
  if (ctx.state.pos !== 0) {
    if (i - ctx.state.entry >= holdBars) { ctx.state.pos = 0; return 0; }
    return ctx.state.pos;
  }
  if (!contig(bars, i, streak)) return 0;
  let down = true;
  let up = true;
  for (let k = i - streak + 1; k <= i; k++) {
    if (!(bars[k].close < bars[k - 1].close)) down = false;
    if (!(bars[k].close > bars[k - 1].close)) up = false;
  }
  let dir = 0;
  if (down) dir = 1;
  else if (up) dir = -1;
  if (dir !== 0) { ctx.state.pos = dir; ctx.state.entry = i; }
  return dir;
}
