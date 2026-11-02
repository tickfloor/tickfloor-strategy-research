export const meta = {
  id: "c1031-cryptoderiv-02",
  name: "Trend long gated by funding crowding percentile (own 180-day history)",
  family: "carry",
  source: "c1031/cryptoderiv",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { sma: 100, mN: 14, win: 180, pctMax: 0.75 },
};

// fdm(n, k): mean funding over bars k-n+1..k, skipping nulls; null unless >= n/2 non-null.
function fdm(n, k, ctx) {
  if (k - n + 1 < 0) return null;
  let sum = 0;
  let cnt = 0;
  for (let j = k - n + 1; j <= k; j++) {
    const v = ctx.fundingRate(j);
    if (v !== null) { sum += v; cnt++; }
  }
  if (cnt < n / 2) return null;
  return sum / cnt;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.ring === undefined) ctx.state.ring = [];
  const ring = ctx.state.ring;
  const m = fdm(p.mN, i, ctx);
  if (m === null) return 0;
  ring.push(m);
  if (ring.length > p.win) ring.shift();
  if (ring.length < p.win) return 0;
  let below = 0;
  for (const v of ring) if (v < m) below++;
  const pct = below / p.win;
  const s = ctx.sma("close", p.sma, i);
  return bars[i].close > s && pct <= p.pctMax ? 1 : 0;
}
