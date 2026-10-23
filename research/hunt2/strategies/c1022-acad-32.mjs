export const meta = {
  id: "c1022-acad-32",
  name: "Volume-conditioned weekly reversal: last-week losers only when the week's volume was high (Conrad-Hameed-Niden)",
  family: "mean_reversion",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "weekly",
  params: { retBars: 5, volBase: 50, bottomFrac: 0.2 },
};

// Candidates: names with volRatio > 1, where volRatio = sum(vol[t-4..t]) / (sum(vol[t-54..t-5]) / 10).
// Long the bottom bottomFrac of the full eligible count by ret5, drawn from candidates only; if fewer candidates than that, long the candidates with ret5 < 0. Equal weight; cash if none.
export function rank(universe, t, ctx) {
  const { retBars, volBase, bottomFrac } = ctx.params;
  const all = [];
  const cand = [];
  for (const s of Object.keys(universe)) {
    const b = universe[s];
    if (b.length <= 60) continue;
    const L = b.length - 1;
    const ret5 = b[L].close / b[L - retBars].close - 1;
    let recent = 0;
    for (let k = L - 4; k <= L; k++) recent += b[k].volume;
    let base = 0;
    for (let k = L - 54; k <= L - 5; k++) base += b[k].volume;
    const volRatio = recent / (base / 10);
    all.push(s);
    if (volRatio > 1) cand.push([s, ret5]);
  }
  const kFull = Math.floor(bottomFrac * all.length);
  cand.sort((x, y) => x[1] - y[1] || (x[0] < y[0] ? -1 : 1));
  const chosen = cand.length >= kFull ? cand.slice(0, kFull) : cand.filter((x) => x[1] < 0);
  if (chosen.length === 0) return {};
  const w = {};
  for (const [s] of chosen) w[s] = 1 / chosen.length;
  return w;
}
