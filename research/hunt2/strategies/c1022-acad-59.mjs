// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-59). Portfolio rank mode, weekly.
// Blitz-Huij-Martens residual momentum in crypto, BTC is the factor only (never scored or held).

export const meta = {
  id: "c1022-acad-59",
  name: "Crypto residual momentum: BTC-beta-adjusted 4-week return (skip 3 days) scaled by residual vol, weekly",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  rebalance: "weekly",
  longShort: false,
  params: { regBars: 180, formBars: 28, skip: 3, topN: 5 },
};

// daily return m bars back from the latest bar (m = 0 is t)
const retAt = (b, m) => b[b.length - 1 - m].close / b[b.length - 2 - m].close - 1;

export function rank(universe, t, ctx) {
  const { regBars, formBars, skip, topN } = ctx.params;
  const btc = universe.BTCUSDT;
  if (!btc || btc.length <= regBars + 1) return {};

  const x = [];
  for (let m = 0; m < regBars; m++) x.push(retAt(btc, m));
  const xMean = x.reduce((a, v) => a + v, 0) / regBars;
  let sxx = 0;
  for (const v of x) sxx += (v - xMean) ** 2;

  const scores = [];
  for (const sym of Object.keys(universe)) {
    if (sym === "BTCUSDT") continue;
    const b = universe[sym];
    if (b.length <= regBars + 1) continue;
    const y = [];
    for (let m = 0; m < regBars; m++) y.push(retAt(b, m));
    const yMean = y.reduce((a, v) => a + v, 0) / regBars;
    let sxy = 0;
    for (let m = 0; m < regBars; m++) sxy += (x[m] - xMean) * (y[m] - yMean);
    const beta = sxy / sxx;
    const alpha = yMean - beta * xMean;
    const e = [];
    for (let m = 0; m < regBars; m++) e.push(y[m] - alpha - beta * x[m]);
    const eMean = e.reduce((a, v) => a + v, 0) / regBars;
    const eStd = Math.sqrt(e.reduce((a, v) => a + (v - eMean) ** 2, 0) / (regBars - 1));
    // sum over k = t-27..t-3 (m = skip..formBars-1)
    let sum = 0;
    for (let m = skip; m < formBars; m++) sum += e[m];
    scores.push({ sym, score: sum / eStd });
  }
  if (scores.length < 3) return {};
  scores.sort((a, c) => c.score - a.score);
  const k = Math.min(topN, scores.length);
  const w = {};
  for (const s of scores.slice(0, k)) w[s.sym] = 1 / topN; // spec: 1/5 each, under-invested when fewer than 5 alts
  return w;
}
