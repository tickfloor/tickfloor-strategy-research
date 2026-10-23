// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-20). Portfolio rank mode, weekly.
export const meta = {
  id: "c1023-acad2-20",
  name: "Crypto frog-in-the-pan: among 12-week winners, long the 5 with the most continuous (least discrete) information arrival (Da-Gurun-Warachka transfer)",
  family: "momentum",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "weekly",
  warmup: 214,
  params: { form: 91, skip: 7, winnersN: 9, pickN: 5 },
};

function pickTop(scores, k, desc) {
  scores.sort((a, b) => (desc ? b[1] - a[1] : a[1] - b[1]) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const chosen = scores.slice(0, Math.min(k, scores.length));
  if (chosen.length < 3) return {};
  const w = {};
  for (const [sym] of chosen) w[sym] = 1 / chosen.length;
  return w;
}

export function rank(universe, t, ctx) {
  const { form, skip, winnersN, pickN } = ctx.params;
  const movers = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 95) continue;
    movers.push([sym, b[L - 1 - skip].close / b[L - 1 - form].close - 1]);
  }
  // winners: the winnersN highest 12-week momentum names with mom > 0
  const winners = movers
    .filter((x) => x[1] > 0)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, winnersN);
  const nDays = form - skip; // 84 daily returns on days t-90..t-7
  const scored = [];
  for (const [sym, mom] of winners) {
    const b = universe[sym];
    const L = b.length;
    let neg = 0;
    let pos = 0;
    for (let k = skip; k <= form - 1; k++) {
      const r = b[L - 1 - k].close / b[L - 2 - k].close - 1;
      if (r < 0) neg++;
      else if (r > 0) pos++;
    }
    const pctNeg = neg / nDays;
    const pctPos = pos / nDays;
    scored.push([sym, Math.sign(mom) * (pctNeg - pctPos)]);
  }
  return pickTop(scored, pickN, false);
}
