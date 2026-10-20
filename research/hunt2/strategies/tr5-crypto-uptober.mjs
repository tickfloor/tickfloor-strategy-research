// trending-1005 (lane m14). Pre-registered in docs/research/trending-1005/prereg.md before any run.
export const meta = {
  id: "tr5-crypto-uptober",
  name: "Uptober: hold crypto through October only, in cash the other eleven months",
  family: "trending-1005",
  source: "24/7 Wall St, Sam Daodu, 2026-10-01 ('a sort of mythos known as Uptober'); Lark Davis 'Bitcoin Enters Uptober' (Oct 2026)",
  assetClass: "crypto",
  timeframe: "1d",
  longShort: false,
  params: { month: 9 },
};

// The position held at the close of bar i earns the next day's return, so hold when the NEXT day is in October (UTC).
export function signal(bars, i, ctx) {
  return new Date((bars[i].time + 86400) * 1000).getUTCMonth() === ctx.params.month ? 1 : 0;
}
