export const meta = {
  id: "c1031-intraday-32",
  name: "Daily and weekly open alignment trend",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { atrBars: 24, entryAtr: 0.25 },
};

const HOUR = 3600;
const hourOf = (b) => Math.floor(b.time / HOUR) % 24;
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7; // 0 = Sun .. 6 = Sat
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * HOUR;
const clear = (ctx) => { for (const k of Object.keys(ctx.state)) delete ctx.state[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  if (!contig(bars, i, 168)) { clear(ctx); return 0; }
  const b = bars[i];
  // dO: open of the most recent 00:00 UTC bar (within 24 bars); wO: open of the most recent Monday 00:00 UTC bar (within 168 bars)
  let dO = NaN;
  for (let k = i; k > i - 24; k--) if (hourOf(bars[k]) === 0) { dO = bars[k].open; break; }
  let wO = NaN;
  for (let k = i; k > i - 168; k--) if (hourOf(bars[k]) === 0 && dowOf(bars[k]) === 1) { wO = bars[k].open; break; }
  if (s.pos !== 0) {
    if (s.pos === 1 ? b.close < dO : b.close > dO) s.pos = 0;
    return s.pos;
  }
  const a = ctx.atr(p.atrBars, i);
  if (b.close > Math.max(dO, wO) + p.entryAtr * a) s.pos = 1;
  else if (b.close < Math.min(dO, wO) - p.entryAtr * a) s.pos = -1;
  return s.pos;
}
