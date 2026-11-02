export const meta = {
  id: "c1031-cryptoderiv-10",
  name: "Open-interest stretch (60-day z>1.5) with price rolling over: short",
  family: "positioning",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT"],
  longShort: true,
  holdBars: 7,
  params: { win: 60, z: 1.5, rollN: 3, hold: 7 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.w === undefined) ctx.state.w = ctx.rolling(p.win);
  const w = ctx.state.w;
  const oi = ctx.openInterest(i);
  if (oi === null) return 0;
  w.push(oi);
  if (!w.full() || i < p.rollN) return 0;
  // population std (rolling.std() is the sample std)
  const sd = w.std() * Math.sqrt((p.win - 1) / p.win);
  if (sd === 0) return 0;
  const z = (oi - w.mean()) / sd;
  return z >= p.z && bars[i].close < bars[i - p.rollN].close ? -1 : 0;
}
