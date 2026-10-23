// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-31). Portfolio rank mode, weekly.
// Weekly return of a complete week = close / open - 1 of that weekly bar (52 complete weeks give L = 52 returns).
const ALPHA = 0.88;
const LAMBDA = 2.25;

function v(x, p) {
  return x >= 0 ? Math.pow(x, p.alpha) : -p.lambda * Math.pow(-x, p.alpha);
}
// probability weighting w(p) = p^g / (p^g + (1-p)^g)^(1/g)
function wgt(pr, g) {
  const a = Math.pow(pr, g);
  return a / Math.pow(a + Math.pow(1 - pr, g), 1 / g);
}

// TK value of L returns, in the spec's literal ordering: negatives sorted ascending so r(-j) = neg[m-j].
function tkValue(rets, p) {
  const L = rets.length;
  const neg = rets.filter((x) => x < 0).sort((a, b) => a - b);
  const pos = rets.filter((x) => x >= 0).sort((a, b) => a - b);
  const m = neg.length;
  const n = pos.length;
  let tk = 0;
  for (let j = 1; j <= m; j++) {
    tk += v(neg[m - j], p) * (wgt(j / L, p.gammaMinus) - wgt((j - 1) / L, p.gammaMinus));
  }
  for (let j = 1; j <= n; j++) {
    tk += v(pos[j - 1], p) * (wgt((n - j + 1) / L, p.gammaPlus) - wgt((n - j) / L, p.gammaPlus));
  }
  return tk;
}

function pickTop(scores, k, desc) {
  scores.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const chosen = scores.slice(0, Math.min(k, scores.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const [sym] of chosen) w[sym] = 1 / chosen.length;
  return w;
}

export const meta = {
  id: "c1023-acad2-31",
  name: "Crypto prospect-theory value: long the 6 coins with the lowest TK value of the past 52 weekly returns, weekly (Barberis-Mukherjee-Wang transfer)",
  family: "other",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 495,
  params: { weeks: 52, alpha: 0.88, lambda: 2.25, gammaPlus: 0.61, gammaMinus: 0.69, bottomN: 6 },
};

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 30) continue;
    const complete = ctx.resample(b, "1w").filter((x) => x.complete);
    if (complete.length < p.weeks) continue;
    const rets = complete.slice(-p.weeks).map((c) => c.close / c.open - 1);
    scores.push([sym, tkValue(rets, p)]);
  }
  return pickTop(scores, p.bottomN, false);
}
