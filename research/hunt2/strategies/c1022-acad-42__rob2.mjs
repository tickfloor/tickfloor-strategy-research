// c1022 acad chunk 3. Etula, Rinne, Suominen & Vaittinen 2020, RFS 33(1); Lou, Yan & Zhang 2013, RFS 26(8).
export const meta = {
  id: "c1022-acad-42__rob2",
  name: "Month-end Treasury rebalancing: long TLT/IEF/AGG over the last 3 sessions of each month (Etula et al.) (+25%)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF", "AGG"],
  params: { lastSessions: 4 },
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }
function ymdOf(t) {
  const d = new Date(t * 1000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function signal(bars, i, ctx) {
  const t = bars[i].time;
  const month = ymdOf(t).slice(0, 7);
  // r = weekdays strictly after t and still inside the same calendar month
  let r = 0;
  for (let s = t + DAY; ymdOf(s).slice(0, 7) === month; s += DAY) {
    const w = dowOf(s);
    if (w >= 1 && w <= 5) r++;
  }
  return r >= 1 && r <= ctx.params.lastSessions ? 1 : 0;
}
