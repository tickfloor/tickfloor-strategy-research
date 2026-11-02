export const meta = {
  id: "c1031-intraday-15",
  name: "Turtle system scaled to hours: 480-bar breakout, 240-bar exit",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { entryBars: 480, exitBars: 240 },
};

const HOUR = 3600;
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * HOUR;
const clear = (ctx) => { for (const k of Object.keys(ctx.state)) delete ctx.state[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const s = ctx.state;
  if (s.pos === undefined) s.pos = 0;
  if (!contig(bars, i, p.entryBars)) { clear(ctx); return 0; }
  const en = ctx.donchian(p.entryBars, i - 1);
  const ex = ctx.donchian(p.exitBars, i - 1);
  const up = en.upper;
  const dn = en.lower;
  const xup = ex.upper;
  const xdn = ex.lower;
  if (![up, dn, xup, xdn].every(Number.isFinite)) return s.pos;
  const c = bars[i].close;
  const pos = s.pos;
  let next = pos;
  if (pos <= 0 && c > up) next = 1;
  else if (pos >= 0 && c < dn) next = -1;
  else if (pos === 1 && c < xdn) next = 0;
  else if (pos === -1 && c > xup) next = 0;
  s.pos = next;
  return next;
}
