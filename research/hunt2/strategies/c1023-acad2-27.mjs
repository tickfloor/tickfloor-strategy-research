// Spec: research/hunt2/campaign-1023/prereg-acad2.json (c1023-acad2-27). Portfolio rank mode, daily.
export const meta = {
  id: "c1023-acad2-27",
  name: "Crypto same-weekday seasonality: each day long the 6 coins with the best average return on the coming weekday over the past year (Keloharju-Linnainmaa-Nyberg transfer)",
  family: "seasonality",
  source: "c1023/acad2",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  warmup: 488,
  params: { lookbackDays: 364, topN: 6 },
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
  const { lookbackDays, topN } = ctx.params;
  // weekday (0 = Sunday) of the day the position holds: dow(t + 1 day)
  const W = (Math.floor(t / 86400) + 5) % 7;
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    const L = b.length;
    if (L <= 370) continue;
    let sum = 0;
    let cnt = 0;
    for (let k = 0; k < lookbackDays; k++) {
      const bar = b[L - 1 - k];
      if ((Math.floor(bar.time / 86400) + 4) % 7 !== W) continue;
      sum += bar.close / b[L - 2 - k].close - 1;
      cnt++;
    }
    if (cnt > 0) scores.push([sym, sum / cnt]);
  }
  return pickTop(scores, topN, true);
}
