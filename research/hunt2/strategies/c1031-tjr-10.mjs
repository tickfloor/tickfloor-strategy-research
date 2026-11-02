// Spec: research/hunt2/campaign-1031/prereg-tjr.json (c1031-tjr-10). Nearest unswept swing draw, decided at the UTC day boundary. 1h crypto.
export const meta = {
  id: "c1031-tjr-10",
  name: "Nearest unswept draw on liquidity: each UTC day, trade toward the nearer untouched swing high/low (crypto 1h)",
  family: "liquidity_draw",
  source: "c1031/tjr",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { k: 2, lookback: 168, minDistATR: 0.5, maxDistATR: 5, disasterMult: 2, maxHold: 24 },
};

// k=2 swing: bar j is confirmed at the close of bar j+2.
function confirm(bars, i, st) {
  const j = i - 2;
  if (j < 2) return;
  const b = bars[j];
  if (b.high > bars[j - 2].high && b.high > bars[j - 1].high && b.high > bars[j + 1].high && b.high > bars[j + 2].high) st.sh.push(j);
  if (b.low < bars[j - 2].low && b.low < bars[j - 1].low && b.low < bars[j + 1].low && b.low < bars[j + 2].low) st.sl.push(j);
}

export function signal(bars, i, ctx) {
  const st = ctx.state, p = ctx.params;
  if (st.sh === undefined) { st.sh = []; st.sl = []; st.pos = 0; st.eb = 0; st.tgt = 0; st.stop = 0; }
  confirm(bars, i, st);
  const b = bars[i], c = b.close;
  const hour = Math.floor(b.time / 3600) % 24;

  if (st.pos !== 0) {
    const hit = st.pos < 0
      ? c <= st.tgt || c >= st.stop || i - st.eb >= p.maxHold
      : c >= st.tgt || c <= st.stop || i - st.eb >= p.maxHold;
    if (!hit) return st.pos;
    st.pos = 0;
    return 0;
  }
  if (hour !== 23) return 0;

  const A = ctx.atr(14);
  if (!(A > 0)) return 0;

  // Unswept = no bar after the swing (through bar i) has traded through its level.
  const lo = i - p.lookback;
  let HU = Infinity, LD = -Infinity;
  for (const j of st.sh) {
    if (j < lo || j > i - 3) continue;
    const L = bars[j].high;
    if (L <= c || L >= HU) continue;
    let swept = false;
    for (let k = j + 1; k <= i && !swept; k++) swept = bars[k].high >= L;
    if (!swept) HU = L;
  }
  for (const j of st.sl) {
    if (j < lo || j > i - 3) continue;
    const L = bars[j].low;
    if (L >= c || L <= LD) continue;
    let swept = false;
    for (let k = j + 1; k <= i && !swept; k++) swept = bars[k].low <= L;
    if (!swept) LD = L;
  }
  if (!(HU < Infinity && LD > -Infinity)) return 0;

  const dU = (HU - c) / A, dD = (c - LD) / A;
  const dNear = Math.min(dU, dD);
  if (!(dNear >= p.minDistATR && dNear <= p.maxDistATR) || dU === dD) return 0;

  const dir = dU < dD ? 1 : -1;
  st.pos = dir;
  st.eb = i;
  st.tgt = dir > 0 ? HU : LD;
  st.stop = c - dir * p.disasterMult * dNear * A;
  return dir;
}
