export const meta = {
  id: "c1031-intraday-05",
  name: "London opening range (08:00-10:00) breakout",
  family: "breakout",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { rangeBars: 2, entryHoursFrom: 10, entryHoursTo: 14, exitHour: 15 },
};

const HOUR = 3600;
const hourOf = (b) => Math.floor(b.time / HOUR) % 24;
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7; // 0 = Sun .. 6 = Sat
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * HOUR;
const clear = (ctx) => { for (const k of Object.keys(ctx.state)) delete ctx.state[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.armed = false; s.traded = false; s.hi = NaN; s.lo = NaN; s.mid = NaN; }
  const h = hourOf(bars[i]);
  const c = bars[i].close;
  if (dowOf(bars[i]) < 1 || dowOf(bars[i]) > 5) { s.pos = 0; s.armed = false; return 0; }
  // range = the 08:00 and 09:00 UTC bars (H==9 bar is the second; its close is the 10:00 price)
  if (h === 9) {
    if (!contig(bars, i, 1)) { clear(ctx); return 0; }
    const hi = Math.max(bars[i - 1].high, bars[i].high);
    const lo = Math.min(bars[i - 1].low, bars[i].low);
    s.hi = hi; s.lo = lo; s.mid = (hi + lo) / 2; s.armed = true; s.traded = false;
    return s.pos;
  }
  if (h < 9 || h >= p.exitHour) { s.pos = 0; s.armed = false; return 0; }
  if (s.pos !== 0) {
    if ((s.pos === 1 && c < s.mid) || (s.pos === -1 && c > s.mid)) s.pos = 0;
    return s.pos;
  }
  if (!s.armed || s.traded || h < p.entryHoursFrom || h > p.entryHoursTo) return 0;
  if (c > s.hi) { s.pos = 1; s.traded = true; }
  else if (c < s.lo) { s.pos = -1; s.traded = true; }
  return s.pos;
}
