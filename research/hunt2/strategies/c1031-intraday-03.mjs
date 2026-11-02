// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-03).
export const meta = {
  id: "c1031-intraday-03",
  name: "Saturday move fade into Sunday",
  family: "mean_reversion",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { dayBars: 24, zEntry: 1.5, holdBars: 24, volWindow: 720 },
};

const H = (t) => Math.floor(t / 3600) % 24;
const D = (t) => (Math.floor(t / 86400) + 4) % 7;
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * 3600;

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.pos === undefined) { ctx.state.pos = 0; ctx.state.exitT = 0; }
  const b = bars[i];
  if (ctx.state.pos !== 0 && b.time >= ctx.state.exitT) ctx.state.pos = 0;
  if (ctx.state.pos !== 0) return ctx.state.pos;
  if (D(b.time) !== 6 || H(b.time) !== 23) return 0;
  // move window (i-23..i) and its sigma window (720 returns ending at i-24) must be contiguous
  if (!contig(bars, i, p.dayBars + p.volWindow)) return 0;
  const R = b.close / bars[i - p.dayBars + 1].open - 1;
  const sd = ctx.rollingStd("ret", p.volWindow, i - p.dayBars);
  if (!(sd > 0)) return 0;
  const z = R / (sd * Math.sqrt(p.dayBars));
  if (z >= p.zEntry) ctx.state.pos = -1;
  else if (z <= -p.zEntry) ctx.state.pos = 1;
  else return 0;
  ctx.state.exitT = b.time + p.holdBars * 3600;
  return ctx.state.pos;
}
