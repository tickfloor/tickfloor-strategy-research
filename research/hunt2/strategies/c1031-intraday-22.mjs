export const meta = {
  id: "c1031-intraday-22",
  name: "Pin bar rejection at a 168-hour extreme",
  family: "mean_reversion",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { extremeBars: 168, wickFrac: 0.6, closeFrac: 0.66, minRangeAtr: 1.0, maxHold: 24 },
};

const HOUR = 3600;
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * HOUR;
const clear = (ctx) => { for (const k of Object.keys(ctx.state)) delete ctx.state[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const s = ctx.state;
  if (s.pos === undefined) { s.pos = 0; s.entry = 0; s.stop = NaN; }
  if (!contig(bars, i, p.extremeBars)) { clear(ctx); return 0; }
  const b = bars[i];
  if (s.pos !== 0) {
    const sma24 = ctx.sma("close", 24, i);
    const hit = s.pos === 1
      ? b.close > sma24 || b.close < s.stop
      : b.close < sma24 || b.close > s.stop;
    if (hit || i - s.entry >= p.maxHold) s.pos = 0;
    return s.pos;
  }
  // flat: pin bar test on bar i
  const rng = b.high - b.low;
  if (!(rng > 0)) return 0;
  const a = ctx.atr(24, i - 1);
  if (!(rng >= p.minRangeAtr * a)) return 0;
  const dc = ctx.donchian(p.extremeBars, i - 1);
  const bodyLo = Math.min(b.open, b.close);
  const bodyHi = Math.max(b.open, b.close);
  if (b.low <= dc.lower && bodyLo - b.low >= p.wickFrac * rng && b.close >= b.low + p.closeFrac * rng) {
    s.pos = 1; s.entry = i; s.stop = b.low;
    return 1;
  }
  if (b.high >= dc.upper && b.high - bodyHi >= p.wickFrac * rng && b.close <= b.low + 0.34 * rng) {
    s.pos = -1; s.entry = i; s.stop = b.high;
    return -1;
  }
  return 0;
}
