export const meta = {
  id: "c1031-intraday-19",
  name: "Extreme 24h move continuation (|z| >= 2.5, hold 24h)",
  family: "momentum",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { moveBars: 24, zEntry: 2.5, holdBars: 24, volWindow: 720 },
};

const HOUR = 3600;
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
  if (!contig(bars, i, p.moveBars)) { clear(ctx); return 0; }
  if (s.pos !== 0) {
    if (i < s.until) return s.pos;
    // exit bar: flat from here; no entry is taken on the exit bar itself
    s.pos = 0;
    return 0;
  }
  const sg = sigma(bars, i - p.moveBars, ctx);
  if (sg === null) return 0;
  const z = (bars[i].close / bars[i - p.moveBars].close - 1) / (sg * Math.sqrt(p.moveBars));
  if (z >= p.zEntry) s.pos = 1;
  else if (z <= -p.zEntry) s.pos = -1;
  else return 0;
  s.until = i + p.holdBars;
  return s.pos;
}
