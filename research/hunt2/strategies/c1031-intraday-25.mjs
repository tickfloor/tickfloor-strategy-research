export const meta = {
  id: "c1031-intraday-25",
  name: "Turtle Soup: failed breakdown of the 120-bar extreme",
  family: "mean_reversion",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { extremeBars: 120, minAge: 4, maxHold: 12 },
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
    const hit = s.pos === 1 ? b.close < s.stop : b.close > s.stop;
    if (hit || i - s.entry >= p.maxHold) s.pos = 0;
    return s.pos;
  }
  const dc = ctx.donchian(p.extremeBars, i - 1);
  const L = dc.lower;
  const U = dc.upper;
  // prior bars i-minAge..i-1 must not have touched the extreme (the broken level is fresh)
  let minLow = Infinity;
  let maxHigh = -Infinity;
  for (let k = i - p.minAge; k <= i - 1; k++) { minLow = Math.min(minLow, bars[k].low); maxHigh = Math.max(maxHigh, bars[k].high); }
  if (b.low < L && b.close > L && minLow > L) { s.pos = 1; s.entry = i; s.stop = b.low; }
  else if (b.high > U && b.close < U && maxHigh < U) { s.pos = -1; s.entry = i; s.stop = b.high; }
  return s.pos;
}
