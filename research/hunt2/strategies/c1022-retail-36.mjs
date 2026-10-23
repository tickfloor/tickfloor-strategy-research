// c1022 retail spec 36 (campaign-1022/prereg-retail.json, frozen before code).
// ConnorsRSI = (RSI(3) close + RSI(2) of streak + PercentRank(100) of 1-day return) / 3.
// Streak RSI is a Wilder RMA (alpha = 1/2) over the streak series, seeded at the first change.
export const meta = {
  id: "c1022-retail-36",
  name: "ConnorsRSI < 10 above the 200-day SMA",
  family: "mean_reversion",
  source: "c1022/retail",
  assetClass: "us_stock",
  timeframe: "1d",
  params: { rsiLen: 3, streakRsiLen: 2, rocRankLen: 100, entry: 10, exit: 70, sma: 200 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params, st = ctx.state;
  if (st.pos === undefined) {
    st.pos = 0; st.streak = 0; st.prevStreak = 0; st.ag = 0; st.al = 0; st.n = 0;
  }
  if (i === 0) return 0;

  // streak: signed count of consecutive up (+) or down (-) closes
  const d = bars[i].close - bars[i - 1].close;
  if (d > 0) st.streak = st.streak > 0 ? st.streak + 1 : 1;
  else if (d < 0) st.streak = st.streak < 0 ? st.streak - 1 : -1;
  else st.streak = 0;
  const ds = st.streak - st.prevStreak;
  st.prevStreak = st.streak;
  const g = Math.max(ds, 0), l = Math.max(-ds, 0);
  if (st.n === 0) { st.ag = g; st.al = l; }
  else { st.ag += (g - st.ag) / p.streakRsiLen; st.al += (l - st.al) / p.streakRsiLen; }
  st.n++;

  if (i <= p.rocRankLen) return st.pos;
  const rsiStreak = st.ag + st.al === 0 ? 50 : 100 - 100 / (1 + st.ag / Math.max(st.al, 1e-12));
  const rsi3 = ctx.rsi(p.rsiLen, i);
  const sma = ctx.sma("close", p.sma, i);
  if (!Number.isFinite(rsi3) || !Number.isFinite(sma)) return st.pos;

  // percent rank: share of the prior 100 one-day returns below today's return
  const today = bars[i].close / bars[i - 1].close - 1;
  let below = 0;
  for (let j = i - p.rocRankLen; j < i; j++) {
    if (bars[j].close / bars[j - 1].close - 1 < today) below++;
  }
  const pr = (100 * below) / p.rocRankLen;
  const crsi = (rsi3 + rsiStreak + pr) / 3;

  if (st.pos === 0) {
    if (crsi < p.entry && bars[i].close > sma) st.pos = 1;
  } else if (crsi > p.exit) {
    st.pos = 0;
  }
  return st.pos;
}
