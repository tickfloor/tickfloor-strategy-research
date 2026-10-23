// c1023 pop chunk 2. ICT weekly open: Mon-Tue dip below the weekly open, reclaim, long to Thursday 23:00 UTC (crypto 1h).
export const meta = {
  id: "c1023-pop-32",
  name: "ICT weekly open: Monday-Tuesday dip below the weekly open then reclaim, long into Thursday close, in an uptrend (hourly crypto)",
  family: "momentum",
  source: "c1023/pop",
  assetClass: "crypto",
  timeframe: "1h",
  params: { trendEma: 1200, entryDays: [1, 2], exitDay: 4, exitHourUtc: 23 },
};

export function signal(bars, i, ctx) {
  const S = ctx.state;
  const p = ctx.params;
  if (S.pos === undefined) { S.pos = 0; S.entry = -1; S.wOpen = undefined; S.wLow = undefined; S.entered = false; S.stop = 0; }
  const b = bars[i];
  const dow = Math.floor(b.time / 86400 + 4) % 7;   // 0 = Sunday, 1 = Monday (UTC)
  const hour = Math.floor(b.time / 3600) % 24;
  if (dow === 1 && hour === 0) {
    S.wOpen = b.open; S.wLow = b.low; S.entered = false;
  } else if (S.wOpen !== undefined && b.low < S.wLow) {
    S.wLow = b.low;
  }
  const c = b.close;
  if (S.pos === 1) {
    if (c < S.stop || (dow === p.exitDay && hour === p.exitHourUtc)) { S.pos = 0; return 0; }
    return 1;
  }
  if (S.wOpen === undefined || i < 1) return 0;
  const dipped = S.wLow < S.wOpen;
  const trend = c > ctx.ema("close", p.trendEma, i);
  const dayOk = p.entryDays.includes(dow);
  if (dayOk && dipped && c > S.wOpen && bars[i - 1].close <= S.wOpen && trend && !S.entered) {
    S.pos = 1; S.entry = i; S.stop = S.wLow; S.entered = true;
    return 1;
  }
  return 0;
}
