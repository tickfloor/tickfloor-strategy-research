// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-06), frozen before code.
// Refs: Frazzini & Pedersen 2014 JFE; Hurst, Ooi & Pedersen 2017 JPM; robustness-0929.md caveat (e).
export const meta = {
  id: "c1022-redteam-06",
  name: "Rank-weighted low BTC-beta scaled by a BTC trend grid",
  family: "equity-factors",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  rebalance: "monthly",
  params: { window: 90, need: 202, minNames: 8, smaWindows: [50, 100, 200] },
};

// ret(b,k) for k = e-W+1..e, e = last bar of this view.
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
  return cov / vb; // (W-1) factors cancel in the ratio
}

function smaAt(b, W) {
  let s = 0;
  for (let j = b.length - W; j < b.length; j++) s += b[j].close;
  return s / W;
}

// Share of BTC trend windows (close above SMA_W). A window with too little history is not counted.
function trendFrac(universe, ctx) {
  const btc = universe.BTCUSDT;
  const wins = ctx.params.smaWindows;
  let k = 0;
  for (const W of wins) {
    if (btc && btc.length >= W && btc[btc.length - 1].close > smaAt(btc, W)) k++;
  }
  return k / wins.length;
}

export function rank(universe, t, ctx) {
  const { window: W, need, minNames } = ctx.params;
  const syms = Object.keys(universe);
  const frac = trendFrac(universe, ctx);
  const ew = {};
  if (syms.length === 0) return ew;
  const scored = syms.filter((s) => universe[s].length >= need);
  if (scored.length < minNames) {
    for (const s of syms) ew[s] = (1 / syms.length) * frac;
    return ew;
  }
  const rb = retWindow(universe.BTCUSDT, W);
  const rows = scored.map((s) => [s, beta(retWindow(universe[s], W), rb)]);
  // position q = 1 is the highest beta; weight q / (n(n+1)/2) so the lowest-beta name is heaviest
  rows.sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const n = rows.length;
  const T = (n * (n + 1)) / 2;
  const w = {};
  rows.forEach(([s], idx) => { w[s] = ((idx + 1) / T) * frac; });
  return w;
}
