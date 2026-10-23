// Spec: research/hunt2/campaign-1024/prereg-acad3.json (c1024-acad3-24). Lou, Yan & Zhang 2013, RFS 26(8), 1891-1912
export const meta = {
  id: "c1024-acad3-24__rob2",
  name: "Treasury auction cycle, both legs: short TLT/IEF for the 5 sessions into each 10-year auction, long for the 5 after (Lou-Yan-Zhang) (+25%)",
  family: "seasonality",
  source: "c1024/acad3",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF"],
  longShort: true,
  params: { preSessions: 6, postSessions: 6 },
};

// Second Wednesday of month m (1-12) of year y, as a UTC day number (m may be 13 = January next year).
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
  const key = y * 12 + m;
  if (st.lastMonth !== key && Math.floor(t / 86400) >= secondWednesday(y, m)) { st.lastMonth = key; st.aIdx = i; }

  // d = session the returned position is held over; A = its auction day (this month's if d <= A, else next month's)
  const tn = t + 86400;
  const dn = Math.floor(tn / 86400);
  const nd = new Date(tn * 1000);
  const ny = nd.getUTCFullYear(), nm = nd.getUTCMonth() + 1;
  let A = secondWednesday(ny, nm);
  if (dn > A) A = secondWednesday(ny, nm + 1);
  if (dn >= A - 8 && dn <= A - 1) return -1; // pre-auction concession, 7 calendar days
  return st.aIdx >= 0 && i - st.aIdx <= ctx.params.postSessions - 1 ? 1 : 0;
}
