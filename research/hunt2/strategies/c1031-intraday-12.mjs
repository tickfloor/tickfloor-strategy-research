export const meta = {
  id: "c1031-intraday-12",
  name: "Prior-day high/low breakout continuation through the US session",
  family: "breakout",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { entryHoursFrom: 8, entryHoursTo: 19, exitHour: 20 },
};

const HOUR = 3600;
const hourOf = (b) => Math.floor(b.time / HOUR) % 24;
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * HOUR;
const clear = (ctx) => { for (const k of Object.keys(ctx.state)) delete ctx.state[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.pdh = NaN; s.pdl = NaN; s.pdm = NaN; s.traded = false; }
  const h = hourOf(bars[i]);
  const c = bars[i].close;
  if (h === 0) {
    // prior day = the 24 bars i-24..i-1
    if (!contig(bars, i, 24)) { clear(ctx); return 0; }
    let hh = -Infinity;
    let ll = Infinity;
    for (let k = i - 24; k <= i - 1; k++) { hh = Math.max(hh, bars[k].high); ll = Math.min(ll, bars[k].low); }
    s.pdh = hh; s.pdl = ll; s.pdm = (hh + ll) / 2; s.traded = false;
  }
  if (h >= p.exitHour) { s.pos = 0; return 0; }
  if (s.pos === 0) {
    if (h >= p.entryHoursFrom && h <= p.entryHoursTo && !s.traded && Number.isFinite(s.pdh)) {
      if (c > s.pdh) { s.pos = 1; s.traded = true; }
      else if (c < s.pdl) { s.pos = -1; s.traded = true; }
    }
    return s.pos;
  }
  if ((s.pos === 1 && c < s.pdm) || (s.pos === -1 && c > s.pdm)) s.pos = 0;
  return s.pos;
}
