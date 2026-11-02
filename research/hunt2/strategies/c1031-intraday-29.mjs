export const meta = {
  id: "c1031-intraday-29",
  name: "US cash-open hour spike fade",
  family: "mean_reversion",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { openHour: 14, zEntry: 2.0, holdBars: 4, volWindow: 720 },
};

const HOUR = 3600;
const hourOf = (b) => Math.floor(b.time / HOUR) % 24;
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7; // 0 = Sun .. 6 = Sat
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
  if (s.pos !== 0 || hourOf(bars[i]) !== p.openHour) return s.pos;
  const dow = dowOf(bars[i]);
  if (dow < 1 || dow > 5) return 0;
  // one-bar move = close[i] / open[i] - 1 (the 14:00 UTC bar); sigma at bar i-1
  if (!contig(bars, i, 1)) { clear(ctx); return 0; }
  const sg = sigma(bars, i - 1, ctx);
  if (sg === null) return 0;
  const z = (bars[i].close / bars[i].open - 1) / sg;
  if (z >= p.zEntry) s.pos = -1;
  else if (z <= -p.zEntry) s.pos = 1;
  else return 0;
  s.until = i + p.holdBars;
  return s.pos;
}
