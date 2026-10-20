// Spec: docs/research/hunt-1003/codex/specs.json (h3-us-volume-profile-poc). Prereg: docs/research/hunt-1003/PREREG.md
export const meta = {
  id: "h3-us-volume-profile-poc",
  name: "Does reclaiming the volume-profile point of control work on stocks?",
  family: "volume-profile",
  source: "retail trading content: stock volume profile point of control reclaim strategy",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL","NVDA","AMZN","GOOGL","META","TSLA","JPM","V","UNH","XOM","JNJ","COST","ABBV","MRK","AVGO","CVX","WMT","BAC","ORCL","ADBE","CRM","NFLX","AMD","INTC","ABT","MCD","DIS","QCOM","TXN","HON","CAT","LOW","SBUX","BA","UPS","PFE","T","MDT","UNP","MMM"],
  longShort: false,
  rebalance: "daily",
  params: { warmupBars: 64, profileBars: 63, priceBins: 24, volumeMeanBars: 20, holdRankDays: 10, topN: 8 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const s = ctx.state;
  if (s.day === undefined) { s.day = -1; s.rec = {}; }
  s.day++;
  const day = s.day;
  for (const sym of Object.keys(s.rec)) if (!universe[sym] || day >= s.rec[sym].expiry) delete s.rec[sym];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const N = b.length;
    if (N < p.warmupBars) { delete s.rec[sym]; continue; }
    const cur = b[N - 1], prev = b[N - 2];
    if (!Number.isFinite(cur.close) || !Number.isFinite(prev.close) || !(cur.volume >= 0)) { delete s.rec[sym]; continue; }
    if (s.rec[sym]) continue;
    let L = Infinity, H = -Infinity, bad = false;
    for (let k = N - 1 - p.profileBars; k < N - 1; k++) {
      const q = b[k];
      if (![q.high, q.low, q.close, q.volume].every(Number.isFinite)) { bad = true; break; }
      L = Math.min(L, q.low); H = Math.max(H, q.high);
    }
    if (bad || !(H > L)) continue;
    const vol = new Float64Array(p.priceBins);
    for (let k = N - 1 - p.profileBars; k < N - 1; k++) {
      const q = b[k];
      const tp = (q.high + q.low + q.close) / 3;
      let bin = Math.floor((tp - L) / (H - L) * p.priceBins);
      if (bin >= p.priceBins) bin = p.priceBins - 1;
      if (bin < 0) bin = 0;
      vol[bin] += q.volume;
    }
    let mb = 0;
    for (let k = 1; k < p.priceBins; k++) if (vol[k] > vol[mb]) mb = k;
    const P = L + (mb + 0.5) * (H - L) / p.priceBins;
    let vs = 0;
    for (let k = N - 1 - p.volumeMeanBars; k < N - 1; k++) vs += b[k].volume;
    if (!(cur.volume > 0) || !(vs > 0)) continue;
    if (prev.close <= P && cur.close > P && cur.volume >= vs / p.volumeMeanBars) s.rec[sym] = { expiry: day + p.holdRankDays, score: cur.close / P - 1 };
  }
  const act = Object.keys(s.rec).map((k) => [k, s.rec[k].score]);
  act.sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
  const top = act.slice(0, Math.min(p.topN, act.length));
  const w = {};
  for (const [sym] of top) w[sym] = 1 / top.length;
  return w;
}
