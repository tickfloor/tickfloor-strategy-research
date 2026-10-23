// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-62). Portfolio rank mode, weekly.
// Blitz & van Vliet 2018 conservative formula in crypto: top momentum inside the lowest-vol half.

export const meta = {
  id: "c1022-acad-62",
  name: "Crypto conservative formula: lowest-vol half, then top 4 by 12-week momentum, weekly (Blitz-van Vliet in crypto)",
  family: "volatility",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  rebalance: "weekly",
  longShort: false,
  params: { volBars: 90, lowVolFrac: 0.5, momEnd: 7, momStart: 84, topN: 4 },
};

export function rank(universe, t, ctx) {
  const { volBars, lowVolFrac, momEnd, momStart, topN } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length > 91);
  const N = elig.length;
  if (N < 3) return {};

  const vols = elig.map((sym) => {
    const b = universe[sym], n = b.length;
    const r = [];
    for (let m = 0; m < volBars; m++) r.push(b[n - 1 - m].close / b[n - 2 - m].close - 1);
    const mean = r.reduce((a, v) => a + v, 0) / volBars;
    return { sym, vol: Math.sqrt(r.reduce((a, v) => a + (v - mean) ** 2, 0) / (volBars - 1)) };
  });
  vols.sort((a, c) => a.vol - c.vol);
  const H = vols.slice(0, Math.floor(lowVolFrac * N)).map((x) => x.sym);

  const mom = H.map((sym) => {
    const b = universe[sym], n = b.length;
    return { sym, mom: b[n - 1 - momEnd].close / b[n - 1 - momStart].close - 1 };
  });
  mom.sort((a, c) => c.mom - a.mom);
  const k = Math.min(topN, mom.length);
  if (k < 3) return {};
  const w = {};
  for (const x of mom.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
