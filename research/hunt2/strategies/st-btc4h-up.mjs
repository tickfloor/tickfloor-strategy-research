export const meta = {
  "id": "st-btc4h-up",
  "name": "Steelman BTC 4h +1% momentum, regime up",
  "family": "steelman-1004",
  "source": "steelman-1004 PREREG (Reddit commenters, day-1004/haiku)",
  "assetClass": "crypto",
  "timeframe": "1h",
  "assets": [
    "BTCUSDT"
  ],
  "params": {
    "trigger": 0.01,
    "exit": 0.01,
    "maxHold": 168,
    "regime": "up"
  }
};

export function signal(bars, i, ctx) {
  const P = ctx.params, S = ctx.state, b = bars[i];
  if (S.w === undefined) { S.w = ctx.rolling(1200); S.hist = []; S.pos = 0; S.cStart = -1; S.cOpen = 0; S.held = 0; S.entry = 0; }
  const start = Math.floor(b.time / 14400) * 14400;
  if (start !== S.cStart) { S.cStart = start; S.cOpen = b.time === start ? b.open : 0; }
  const complete = b.time === start + 10800 && S.cOpen > 0;
  let regime = "none";
  if (complete) {
    S.w.push(b.close);
    const m = S.w.mean();
    S.hist.push(m);
    const k = S.hist.length;
    if (S.w.full() && k > 120) {
      const mp = S.hist[k - 121];
      regime = b.close > m && m > mp ? "up" : b.close < m && m < mp ? "down" : "chop";
    }
  }
  if (S.pos === 1) {
    S.held++;
    if (b.close >= S.entry * (1 + P.exit) || b.close <= S.entry * (1 - P.exit) || S.held >= P.maxHold) { S.pos = 0; return 0; }
    return 1;
  }
  if (complete && regime !== "none" && b.close / S.cOpen - 1 >= P.trigger && (P.regime === "all" || P.regime === regime)) {
    S.pos = 1; S.entry = b.close; S.held = 0; return 1;
  }
  return 0;
}
