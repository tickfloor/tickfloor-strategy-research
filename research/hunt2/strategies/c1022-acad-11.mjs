// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-11). Liu, Tsyvinski & Wu 2022, 'Common risk factors in cryptocurrency', Journal of Finance 77(2), 1133-1177
export const meta = {
  id: "c1022-acad-11",
  name: "Crypto one-week cross-sectional momentum, weekly (Liu-Tsyvinski-Wu r1,0)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  rebalance: "weekly",
  params: { formBars: 7, topFrac: 0.3 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const list = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= p.formBars + 1) continue;
    list.push({ sym, score: b[L - 1].close / b[L - 1 - p.formBars].close - 1 });
  }
  const E = list.length;
  if (E < 3) return {};
  const k = Math.min(E, Math.max(3, Math.floor(p.topFrac * E)));
  list.sort((a, b) => b.score - a.score || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of list.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
