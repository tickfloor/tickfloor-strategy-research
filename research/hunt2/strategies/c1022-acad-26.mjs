export const meta = {
  id: "c1022-acad-26",
  name: "Volatility-managed sector ETFs: scale each sector by target variance / last-month realised variance (Moreira-Muir)",
  family: "volatility",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ"],
  rebalance: "monthly",
  params: { rvBars: 21, targetVar: 0.0225, maxScale: 1.5 },
};

// Sample variance of the last n daily returns.
function retVar(b, n) {
  const rets = [];
  for (let k = b.length - n; k < b.length; k++) rets.push(b[k].close / b[k - 1].close - 1);
  let m = 0;
  for (const x of rets) m += x;
  m /= n;
  let s = 0;
  for (const x of rets) s += (x - m) * (x - m);
  return s / (n - 1);
}

// w_i = (1/11) * min(1.5, 0.0225 / RV_i), RV_i = 252 * variance; rescaled if the sum exceeds 1.
export function rank(universe, t, ctx) {
  const { rvBars, targetVar, maxScale } = ctx.params;
  const w = {};
  let sum = 0;
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= rvBars + 1) continue;
    const RV = retVar(b, rvBars) * 252;
    const scale = RV > 0 ? Math.min(maxScale, targetVar / RV) : maxScale;
    w[s] = scale / 11;
    sum += w[s];
  }
  if (sum > 1) for (const s of Object.keys(w)) w[s] /= sum;
  return w;
}
