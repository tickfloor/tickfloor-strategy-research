// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-20).
export const meta = {
  id: "c1031-intraday-20",
  name: "Bollinger(48, 2.5) reversion against the 14-day trend",
  family: "mean_reversion",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { bbBars: 48, k: 2.5, trendEma: 336, maxHold: 48 },
};

const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * 3600;
const clear = (st) => { for (const k of Object.keys(st)) delete st[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.entryI = -1; }
  if (!contig(bars, i, p.trendEma)) { clear(st); return 0; }

  const c = bars[i].close;
  const m = ctx.sma("close", p.bbBars, i);
  const s = ctx.rollingStd("close", p.bbBars, i);
  const tr = ctx.ema("close", p.trendEma, i);

  // exit bar returns 0; no same-bar re-entry
  if (st.pos !== 0) {
    if ((st.pos === 1 && c >= m) || (st.pos === -1 && c <= m) || i - st.entryI >= p.maxHold) st.pos = 0;
    return st.pos;
  }
  if (c < m - p.k * s && c > tr) { st.pos = 1; st.entryI = i; }
  else if (c > m + p.k * s && c < tr) { st.pos = -1; st.entryI = i; }
  return st.pos;
}
