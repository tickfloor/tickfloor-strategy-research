// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-23).
export const meta = {
  id: "c1031-intraday-23",
  name: "Triple-EMA ribbon pullback to the 21 EMA",
  family: "trend",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { fast: 8, mid: 21, slow: 55, slopeBars: 12 },
};

const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * 3600;
const clear = (st) => { for (const k of Object.keys(st)) delete st[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) st.pos = 0;
  if (!contig(bars, i, p.slow + p.slopeBars)) { clear(st); return 0; }

  const b = bars[i];
  const e8 = ctx.ema("close", p.fast, i);
  const e21 = ctx.ema("close", p.mid, i);
  const e55 = ctx.ema("close", p.slow, i);
  const e55p = ctx.ema("close", p.slow, i - p.slopeBars);

  if (st.pos === 1) { if (b.close < e55) st.pos = 0; return st.pos; }
  if (st.pos === -1) { if (b.close > e55) st.pos = 0; return st.pos; }

  const up = e8 > e21 && e21 > e55 && e55 > e55p;
  const dn = e8 < e21 && e21 < e55 && e55 < e55p;
  if (up && b.low <= e21 && b.close > e21) st.pos = 1;
  else if (dn && b.high >= e21 && b.close < e21) st.pos = -1;
  return st.pos;
}
