// Spec: research/hunt2/campaign-1022/prereg-redteam.json (c1022-redteam-22). Frozen before code.
export const meta = {
  id: "c1022-redteam-22__rob1",
  name: "Crypto breadth gate with hysteresis: in when 60% of coins are above their 50-day SMA, out at 40% (-25%)",
  family: "breadth",
  source: "c1022/redteam",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  params: { sma: 38, need: 40, on: 0.6, off: 0.4, minCoins: 6 },
};

export function rank(universe, t, ctx) {
  const { sma, need, on, off, minCoins } = ctx.params;
  const syms = Object.keys(universe).sort();
  const ew = () => { const w = {}; for (const s of syms) w[s] = 1 / syms.length; return w; };
  if (ctx.state.on === undefined) ctx.state.on = false;

  const q = syms.filter((s) => universe[s].length >= need);
  if (q.length < minCoins) return ew();

  let above = 0;
  for (const s of q) {
    const b = universe[s], e = b.length - 1;
    let sum = 0;
    for (let k = e - sma + 1; k <= e; k++) sum += b[k].close;
    if (b[e].close > sum / sma) above++;
  }
  const breadth = above / q.length;
  if (breadth >= on) ctx.state.on = true;
  else if (breadth <= off) ctx.state.on = false;

  if (!ctx.state.on) return {};
  return ew();
}
