// tests-1010 (lane l-tests-1010). Pre-registered in docs/research/tests-1010/prereg.md before any run.
export const meta = {
  id: "t1010-turnaround-tue-e",
  name: "Turnaround Tuesday: buy Monday close after a down Monday, sell Tuesday close, QQQ+DIA 1d",
  family: "tests-1010",
  source: "Stephen Bigalow / Stock Trader's Almanac 'Turnaround Tuesday'",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  longShort: false,
  params: { weekday: 1 },
};
export function signal(bars, i, ctx) {
  if (i < 1) return 0;
  const wd = (Math.floor(bars[i].time / 86400) + 4) % 7; // 0 = Sunday
  return wd === ctx.params.weekday && bars[i].close < bars[i - 1].close ? 1 : 0;
}
