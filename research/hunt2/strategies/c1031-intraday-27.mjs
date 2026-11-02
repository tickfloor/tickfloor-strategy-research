// Spec: research/hunt2/campaign-1031/prereg-intraday.json (c1031-intraday-27).
export const meta = {
  id: "c1031-intraday-27",
  name: "Prior-day close-location continuation into the next morning",
  family: "momentum",
  source: "c1031/intraday",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { hiThresh: 0.8, loThresh: 0.2, holdBars: 12 },
};

const H = (t) => Math.floor(t / 3600) % 24;
const contig = (bars, i, n) => i - n >= 0 && bars[i].time - bars[i - n].time === n * 3600;
const clear = (st) => { for (const k of Object.keys(st)) delete st[k]; };

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.exitT = -1; }
  const b = bars[i];
  if (st.pos !== 0 && b.time >= st.exitT) st.pos = 0;
  if (st.pos !== 0) return st.pos;
  if (H(b.time) !== 23) return 0;
  if (!contig(bars, i, 23)) { clear(st); return 0; }

  let dh = -Infinity, dl = Infinity;
  for (let k = i - 23; k <= i; k++) { dh = Math.max(dh, bars[k].high); dl = Math.min(dl, bars[k].low); }
  if (dh === dl) return 0;
  const clv = (b.close - dl) / (dh - dl);
  if (clv >= p.hiThresh) st.pos = 1;
  else if (clv <= p.loThresh) st.pos = -1;
  else return 0;
  st.exitT = b.time + p.holdBars * 3600;
  return st.pos;
}
