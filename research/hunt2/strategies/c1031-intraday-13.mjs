// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-13).
export const meta = {
  id: "c1031-intraday-13",
  name: "TTM squeeze release on hourly crypto",
  family: "volatility",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { bbBars: 20, bbK: 2, kcAtrBars: 20, kcMult: 1.5, minSqueezeBars: 6, maxHoldBars: 48 },
};

const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * 3600;
const clear = (st) => { for (const k of Object.keys(st)) delete st[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.run = 0; st.entryI = -1; }
  if (!contig(bars, i, Math.max(p.bbBars, p.kcAtrBars))) { clear(st); return 0; }

  const s = ctx.rollingStd("close", p.bbBars, i);
  const a = ctx.atr(p.kcAtrBars, i);
  const sqOn = p.bbK * s < p.kcMult * a;
  const runBefore = st.run;
  const release = !sqOn && runBefore >= p.minSqueezeBars;
  st.run = sqOn ? runBefore + 1 : 0;

  const dc = ctx.donchian(p.bbBars, i);
  const mom = bars[i].close - ((dc.upper + dc.lower) / 2 + ctx.sma("close", p.bbBars, i)) / 2;

  if (st.pos !== 0) {
    if ((st.pos === 1 && mom < 0) || (st.pos === -1 && mom > 0) || i - st.entryI >= p.maxHoldBars) st.pos = 0;
    return st.pos;
  }
  if (release && mom > 0) { st.pos = 1; st.entryI = i; }
  else if (release && mom < 0) { st.pos = -1; st.entryI = i; }
  return st.pos;
}
