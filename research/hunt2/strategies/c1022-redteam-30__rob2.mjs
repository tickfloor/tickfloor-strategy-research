// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-30), frozen before code.
// Refs: Asness, Moskowitz & Pedersen 2013 JF (combination portfolios); DeMiguel, Garlappi & Uppal 2009 RFS (1/N).
export const meta = {
  id: "c1022-redteam-30__rob2",
  name: "Equal-weight ensemble of the three crypto leader families, weekly (+25%)",
  family: "other",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  rebalance: "weekly",
  params: { betaWindow: 113, momLookback: 21, momFrac: 0.3, smaWindows: [20, 50, 100, 200], need: 202, minNames: 8 },
};

function retWindow(b, W) {
  const e = b.length - 1;
  const out = [];
  for (let k = e - W + 1; k <= e; k++) out.push(b[k].close / b[k - 1].close - 1);
  return out;
}

function beta(rs, rb) {
  const W = rs.length;
  let ms = 0, mb = 0;
  for (let j = 0; j < W; j++) { ms += rs[j]; mb += rb[j]; }
  ms /= W; mb /= W;
  let cov = 0, vb = 0;
  for (let j = 0; j < W; j++) { cov += (rs[j] - ms) * (rb[j] - mb); vb += (rb[j] - mb) ** 2; }
  return cov / vb;
}

function smaAt(b, W) {
  let s = 0;
  for (let j = b.length - W; j < b.length; j++) s += b[j].close;
  return s / W;
}

export function rank(universe, t, ctx) {
  const P = ctx.params;
  const syms = Object.keys(universe);
  const V = syms.length;
  const out = {};
  if (V === 0) return out;
  const ref = universe.BTCUSDT;
  const scored = syms.filter((s) => universe[s].length >= P.need);
  const fallback = scored.length < P.minNames;

  // low-beta leg: rank weights on beta vs BTC (BTC scored with its own beta)
  const lowBeta = {};
  if (fallback) {
    for (const s of syms) lowBeta[s] = 1 / V;
  } else {
    const rb = retWindow(ref, P.betaWindow);
    const rows = scored.map((s) => [s, beta(retWindow(universe[s], P.betaWindow), rb)]);
    rows.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const T = (rows.length * (rows.length + 1)) / 2;
    rows.forEach(([s], idx) => { lowBeta[s] = (idx + 1) / T; });
  }

  // momentum leg: top max(3, round(momFrac * n)) by 21-day return, equal weight
  const mom = {};
  if (fallback) {
    for (const s of syms) mom[s] = 1 / V;
  } else {
    const rows = scored.map((s) => {
      const b = universe[s];
      const e = b.length - 1;
      return [s, b[e].close / b[e - P.momLookback].close - 1];
    });
    rows.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const k = Math.max(3, Math.round(P.momFrac * rows.length));
    for (const [s] of rows.slice(0, k)) mom[s] = 1 / k;
  }

  // trend leg: per coin (k / #windows) / n over the view; 1/n during warm-up (L < need)
  const nW = P.smaWindows.length;
  for (const s of syms) {
    const b = universe[s];
    let trend = 1 / V;
    if (b.length >= P.need) {
      let k = 0;
      for (const W of P.smaWindows) if (b[b.length - 1].close > smaAt(b, W)) k++;
      trend = (k / nW) / V;
    }
    out[s] = ((lowBeta[s] || 0) + (mom[s] || 0) + trend) / 3;
  }
  return out;
}
