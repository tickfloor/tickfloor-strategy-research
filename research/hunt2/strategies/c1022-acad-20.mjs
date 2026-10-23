export const meta = {
  id: "c1022-acad-20",
  name: "Risk-adjusted time-series momentum: weight by the trailing 1-year Sharpe, vol-targeted (Dudler-Gmuer-Malamud)",
  family: "trend",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA", "XLK", "XLF", "XLE", "XLV", "XLI", "XLP", "XLY", "XLU", "XLB", "XLC", "VNQ", "TLT", "IEF", "SHY", "LQD", "HYG", "AGG", "GLD", "SLV", "USO", "UNG", "DBC", "UUP"],
  rebalance: "weekly",
  params: { sharpeBars: 252, volBars: 60, targetVol: 0.1, clamp: 2 },
};

// last n daily returns of a bar view
function lastRets(b, n) {
  const out = [];
  for (let k = b.length - n; k < b.length; k++) out.push(b[k].close / b[k - 1].close - 1);
  return out;
}

function meanStd(xs) {
  const n = xs.length;
  let m = 0;
  for (const x of xs) m += x;
  m /= n;
  let s = 0;
  for (const x of xs) s += (x - m) * (x - m);
  return { m, sd: Math.sqrt(s / (n - 1)) };
}

export function rank(universe, t, ctx) {
  const { sharpeBars, volBars, targetVol, clamp } = ctx.params;
  const syms = Object.keys(universe).filter((s) => universe[s].length > sharpeBars + 1);
  const N = syms.length;
  if (N === 0) return {};
  const raw = {};
  let sum = 0;
  for (const s of syms) {
    const b = universe[s];
    const { m, sd } = meanStd(lastRets(b, sharpeBars));
    const S = sd > 0 ? (m / sd) * Math.sqrt(252) : 0;
    const sig = Math.max(0, Math.min(clamp, S)) / clamp;
    const vol = Math.max(meanStd(lastRets(b, volBars)).sd * Math.sqrt(252), 0.01);
    raw[s] = (sig * (targetVol / vol)) / N;
    sum += raw[s];
  }
  const scale = sum > 1 ? 1 / sum : 1;
  const w = {};
  for (const s of syms) w[s] = raw[s] * scale;
  return w;
}
