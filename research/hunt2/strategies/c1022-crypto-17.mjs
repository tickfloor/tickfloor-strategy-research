// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-17). Frozen before code.
export const meta = {
  id: "c1022-crypto-17",
  name: "Weekend range breakout in the Monday-Tuesday session",
  family: "trend",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { windowHours: 48, stopMid: true, exitHour: 23 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;

export function signal(bars, i, ctx) {
  const { windowHours, exitHour } = ctx.params;
  const s = ctx.state;
  if (s.hi === undefined) { s.hi = null; s.lo = null; s.mid = null; s.pos = 0; s.traded = false; }
  const b = bars[i];
  const d = dowOf(b), h = hourOf(b);
  if (d === 1 && h === 0) {
    let hi = -Infinity, lo = Infinity, any = false;
    for (let j = i - 1; j >= Math.max(0, i - windowHours); j--) {
      const dj = dowOf(bars[j]);
      if (dj !== 6 && dj !== 0) continue;
      any = true;
      if (bars[j].high > hi) hi = bars[j].high;
      if (bars[j].low < lo) lo = bars[j].low;
    }
    s.pos = 0; s.traded = false;
    s.hi = any ? hi : null; s.lo = any ? lo : null; s.mid = any ? (hi + lo) / 2 : null;
  }
  if (s.hi === null || !(d === 1 || d === 2)) return 0;
  if (s.pos === 0 && !s.traded) {
    if (b.close > s.hi) { s.pos = 1; s.traded = true; }
    else if (b.close < s.lo) { s.pos = -1; s.traded = true; }
  } else if (s.pos === 1 && b.close < s.mid) s.pos = 0;
  else if (s.pos === -1 && b.close > s.mid) s.pos = 0;
  if (d === 2 && h === exitHour) s.pos = 0;
  return s.pos;
}
