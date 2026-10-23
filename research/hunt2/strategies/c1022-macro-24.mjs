export const meta = {
  id: "c1022-macro-24",
  name: "Buy Treasuries after a 5-day real-yield spike",
  family: "mean_reversion",
  source: "c1022/macro", // cited: Taper-tantrum literature (Feroli, Kashyap, Schoenholtz & Shin 2014 Market tantrums and monetary policy)
  assetClass: "etf",
  timeframe: "1d",
  assets: ["TLT", "IEF"],
  holdBars: 10,
  params: { lookback: 5, bp: 0.2, hold: 10 },
};

export function signal(bars, i, ctx) {
  if (i - 5 < 0) return 0;
  const a = ctx.macro("DFII10", i), b = ctx.macro("DFII10", i - 5);
  if (a === null || b === null) return 0;
  return a - b >= 0.2 ? 1 : 0;
}
