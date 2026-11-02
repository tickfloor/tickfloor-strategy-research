export const meta = {
  id: "c1031-intraday-02",
  name: "Asia-session move continues into the London session",
  family: "momentum",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { sessionBars: 8, zEntry: 1.5, holdBars: 6, volWindow: 720 },
};

const HOUR = 3600;
const hourOf = (b) => Math.floor(b.time / HOUR) % 24;
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * HOUR;
// sigma(j): sample std of the volWindow hourly returns ending at bar j, or null when unusable
function sigma(bars, j, ctx) {
  const w = ctx.params.volWindow;
  if (j < 0 || !contig(bars, j, w)) return null;
  const s = ctx.rollingStd("ret", w, j);
  return Number.isFinite(s) && s > 0 ? s : null;
}
const clear = (ctx) => { for (const k of Object.keys(ctx.state)) delete ctx.state[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.until = 0; }
  if (s.pos !== 0 && i >= s.until) s.pos = 0;
  if (s.pos !== 0 || hourOf(bars[i]) !== 7) return s.pos;
  // move = close[i] / open[i-7] - 1 over the 8 bars 00:00-08:00 UTC; sigma at bar i-8
  const n = p.sessionBars - 1;
  if (!contig(bars, i, n + 1)) { clear(ctx); return 0; } // bars i-8..i: move window plus the sigma anchor bar
  const sg = sigma(bars, i - n - 1, ctx);
  if (sg === null) return 0;
  const z = (bars[i].close / bars[i - n].open - 1) / (sg * Math.sqrt(p.sessionBars));
  if (z >= p.zEntry) s.pos = 1;
  else if (z <= -p.zEntry) s.pos = -1;
  else return 0;
  s.until = i + p.holdBars;
  return s.pos;
}
