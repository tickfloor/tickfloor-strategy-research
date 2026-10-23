// Spec: research/hunt2/campaign-1022/prereg-acad.json (c1022-acad-12). Liu, Tsyvinski & Wu 2022, 'Common risk factors in cryptocurrency', Journal of Finance 77(2); Baker, Bradley & Wurgler 2011, 'Benchmarks as limits to arbitrage', FAJ 67(1)
export const meta = {
  id: "c1022-acad-12",
  name: "Crypto low realised volatility, weekly (low-vol anomaly test in the LTW cross-section)",
  family: "volatility",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  rebalance: "weekly",
  params: { volBars: 30, topN: 6 },
};

function lastReturns(b, n) {
  const out = [];
  for (let i = b.length - n; i < b.length; i++) out.push(b[i].close / b[i - 1].close - 1);
  return out;
}

function stdDev(a) {
  const m = a.reduce((s, x) => s + x, 0) / a.length;
  return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length);
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const list = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= p.volBars + 1) continue;
    list.push({ sym, vol: stdDev(lastReturns(b, p.volBars)) });
  }
  const E = list.length;
  if (E < 3) return {};
  const k = Math.min(p.topN, E);
  list.sort((a, b) => a.vol - b.vol || (a.sym < b.sym ? -1 : 1));
  const w = {};
  for (const x of list.slice(0, k)) w[x.sym] = 1 / k;
  return w;
}
