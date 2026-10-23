// Spec: research/hunt2/campaign-1022/prereg-crypto.json (c1022-crypto-47). Portfolio rank mode, weekly, long-short.

export const meta = {
  id: "c1022-crypto-47",
  name: "Alt/BTC ratio z-score reversion, long-short",
  family: "mean_reversion",
  source: "c1022/crypto",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  longShort: true,
  params: { win: 60, z: 2.0 },
};

export function rank(universe, t, ctx) {
  const { win, z: zThr } = ctx.params;
  const s = ctx.state;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length < win + 1) return {};
  const off = btc.length - win - 1;
  // alts with >= 61 bars: time-keyed closes over the window
  const alts = Object.keys(universe).filter((k) => k !== "BTCUSDT" && universe[k].length >= 61);
  const maps = alts.map((k) => {
    const b = universe[k];
    const m = new Map();
    for (let j = b.length - win - 1; j < b.length; j++) m.set(b[j].time, b[j].close);
    return m;
  });
  // EW-alt index (cumulative daily returns) and ln(index / BTC close) for the last win days
  let idx = 1;
  const lnRatio = [];
  for (let j = 1; j <= win; j++) {
    const t0 = btc[off + j - 1].time;
    const t1 = btc[off + j].time;
    let sum = 0;
    let cnt = 0;
    for (const m of maps) {
      const a0 = m.get(t0);
      const a1 = m.get(t1);
      if (a0 !== undefined && a1 !== undefined) { sum += a1 / a0 - 1; cnt++; }
    }
    if (cnt) idx *= 1 + sum / cnt;
    lnRatio.push(Math.log(idx) - Math.log(btc[off + j].close));
  }
  const mean = lnRatio.reduce((a, x) => a + x, 0) / win;
  const sd = Math.sqrt(lnRatio.reduce((a, x) => a + (x - mean) ** 2, 0) / (win - 1));
  const z = (lnRatio[win - 1] - mean) / sd;

  // state machine: enter a leg at |z| >= 2, hold until |z| < 0.5, then cash (no direct flip)
  let leg = s.leg;
  if (!leg) {
    if (z <= -zThr) leg = "L";
    else if (z >= zThr) leg = "S";
  } else if (Math.abs(z) < 0.5) {
    leg = null;
  }
  s.leg = leg || null;
  if (!leg || !alts.length) return {};
  const sign = leg === "L" ? 1 : -1;
  const w = {};
  for (const k of alts) w[k] = (sign * 0.5) / alts.length;
  w.BTCUSDT = -sign * 0.5;
  return w;
}
