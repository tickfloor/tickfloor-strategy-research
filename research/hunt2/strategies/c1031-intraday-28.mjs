// c1031-intraday-28: 72-hour log-price regression t-statistic trend (|t| >= 3 enters, |t| < 1 exits).
// Spec: research/hunt2/campaign-1031/prereg-intraday.json (frozen before this file was written).

export const meta = {
  id: "c1031-intraday-28",
  name: "72-hour regression t-statistic trend (|t| >= 3)",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { windowBars: 72, tEntry: 3.0, tExit: 1.0 },
};

// True when bars j-n..j are consecutive hourly bars (no gap).
const contig = (bars, j, n) => j >= n && bars[j].time - bars[j - n].time === n * 3600;

export function signal(bars, i, ctx) {
  const { windowBars: N, tEntry, tExit } = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  if (!contig(bars, i, N - 1)) { ctx.state.pos = 0; return 0; }
  const start = i - N + 1;
  const y = new Array(N);
  let sx = 0;
  let sy = 0;
  for (let x = 0; x < N; x++) { y[x] = Math.log(bars[start + x].close); sx += x; sy += y[x]; }
  const xm = sx / N;
  const ym = sy / N;
  let sxy = 0;
  let sxx = 0;
  for (let x = 0; x < N; x++) { sxy += (x - xm) * (y[x] - ym); sxx += (x - xm) * (x - xm); }
  const b = sxy / sxx;
  const a = ym - b * xm;
  let sse = 0;
  for (let x = 0; x < N; x++) { const r = y[x] - (a + b * x); sse += r * r; }
  const se = Math.sqrt(sse / (N - 2)) / Math.sqrt(sxx);
  const t = b / se;
  const pos = ctx.state.pos;
  if (pos === 0) {
    if (t >= tEntry) ctx.state.pos = 1;
    else if (t <= -tEntry) ctx.state.pos = -1;
  } else if (pos === 1) {
    if (t <= -tEntry) ctx.state.pos = -1;
    else if (t < tExit) ctx.state.pos = 0;
  } else if (pos === -1) {
    if (t >= tEntry) ctx.state.pos = 1;
    else if (t > -tExit) ctx.state.pos = 0;
  }
  return ctx.state.pos;
}
