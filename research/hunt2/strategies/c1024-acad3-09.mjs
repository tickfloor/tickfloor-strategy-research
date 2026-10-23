// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-09). Lou, Yan & Zhang 2013, RFS 26(8), 1891-1912
export const meta = {
  id: "c1024-acad3-09",
  name: "Treasury auction cycle: long TLT/IEF for the 5 sessions after each month's 10-year note auction (Lou-Yan-Zhang)",
  family: "seasonality",
  source: "c1024/acad3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF"],
  longShort: false,
  params: { holdSessions: 5 },
};

// Second Wednesday of month m (1-12) of year y, as a UTC day number.
function secondWednesday(y, m) {
  const first = Date.UTC(y, m - 1, 1) / 86400000;
  const dow = (((first + 4) % 7) + 7) % 7; // 0 = Sunday
  return first + ((3 - dow + 7) % 7) + 7;
}

export function signal(bars, i, ctx) {
  const st = ctx.state;
  if (st.lastMonth === undefined) { st.lastMonth = -1; st.aIdx = -1; }
  const t = bars[i].time;
  const dt = new Date(t * 1000);
  const y = dt.getUTCFullYear(), m = dt.getUTCMonth() + 1;
  const d = Math.floor(t / 86400);
  const key = y * 12 + m;
  // first bar with date >= this month's auction day is the auction index a
  if (st.lastMonth !== key && d >= secondWednesday(y, m)) { st.lastMonth = key; st.aIdx = i; }
  return st.aIdx >= 0 && i - st.aIdx <= ctx.params.holdSessions - 1 ? 1 : 0;
}
