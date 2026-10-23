// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-18). Frozen before code.
export const meta = {
  id: "c1022-crypto-18",
  name: "CME-gap fill: trade back toward the Friday 21:00 UTC close",
  family: "mean_reversion",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1h",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  params: { friHour: 21, monHour: 0, minGap: 0.01, maxHold: 48 },
};
const dowOf = (b) => (Math.floor(b.time / 86400) + 4) % 7;
const hourOf = (b) => Math.floor(b.time / 3600) % 24;

export function signal(bars, i, ctx) {
  const { friHour, monHour, minGap, maxHold } = ctx.params;
  const s = ctx.state;
  if (s.fri === undefined) { s.fri = null; s.pos = 0; s.held = 0; s.target = null; }
  const b = bars[i];
  const d = dowOf(b), h = hourOf(b);
  if (d === 5 && h === friHour) s.fri = b.close;
  if (s.pos !== 0) {
    s.held++;
    if ((s.pos === -1 && b.low <= s.target) || (s.pos === 1 && b.high >= s.target) || s.held >= maxHold) s.pos = 0;
    return s.pos;
  }
  if (d === 1 && h === monHour && s.fri !== null) {
    const fri = s.fri;
    s.fri = null;
    const gap = b.close / fri - 1;
    if (gap >= minGap) { s.pos = -1; s.target = fri; s.held = 0; }
    else if (gap <= -minGap) { s.pos = 1; s.target = fri; s.held = 0; }
  }
  return s.pos;
}
