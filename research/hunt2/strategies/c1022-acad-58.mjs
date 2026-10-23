// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-58). Portfolio rank mode, weekly.
// Daniel & Moskowitz crash gate applied to crypto 3-week momentum.

export const meta = {
  id: "c1022-acad-58",
  name: "Crypto momentum crash gate: 3-week cross-sectional momentum scaled down after a bear year with high vol (Daniel-Moskowitz in crypto)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  rebalance: "weekly",
  longShort: false,
  params: { formBars: 21, topFrac: 0.3, bearBars: 365, volBars: 30, volThresholdAnn: 0.8 },
};

export function rank(universe, t, ctx) {
  const { formBars, topFrac, bearBars, volBars, volThresholdAnn } = ctx.params;
  const elig = Object.keys(universe).filter((s) => universe[s].length > 366);
  const N = elig.length;
  if (N < 3) return {};

  // EW crypto market daily returns, oldest first, over the last bearBars days
  const mkt = [];
  for (let m = bearBars - 1; m >= 0; m--) {
    let s = 0;
    for (const sym of elig) {
      const b = universe[sym], n = b.length;
      s += b[n - 1 - m].close / b[n - 2 - m].close - 1;
    }
    mkt.push(s / N);
  }
  let cum = 1;
  for (const r of mkt) cum *= 1 + r;
  const bear = cum - 1 < 0;

  const last30 = mkt.slice(-volBars);
  const mean30 = last30.reduce((a, v) => a + v, 0) / volBars;
  const std30 = Math.sqrt(last30.reduce((a, v) => a + (v - mean30) ** 2, 0) / (volBars - 1));
  const highVol = std30 * Math.sqrt(365) > volThresholdAnn;

  const s = 1 - 0.5 * (bear + highVol); // 1 neither, 0.5 one, 0 both
  if (s === 0) return {};

  const scores = elig.map((sym) => {
    const b = universe[sym], n = b.length;
    return { sym, mom: b[n - 1].close / b[n - 1 - formBars].close - 1 };
  });
  const k = Math.max(3, Math.floor(topFrac * N));
  scores.sort((a, c) => c.mom - a.mom);
  const w = {};
  // weight s/k on each pick (N = number of picks, as in the other rank specs)
  for (const x of scores.slice(0, k)) w[x.sym] = s / k;
  return w;
}
