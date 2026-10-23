// c1022 retail spec 41 (campaign-1022/prereg-retail.json, frozen before code).
// Portfolio: hold alts whose close/BTC ratio is above its 50-day SMA, only while BTC is above its 50-day SMA.
export const meta = {
  id: "c1022-retail-41__rob1",
  name: "Alt/BTC ratio above its 50-day SMA (alts that beat Bitcoin) (-25%)",
  family: "momentum",
  source: "c1022/retail",
  assetClass: "crypto",
  timeframe: "1d",
  universe: "CRYPTO_DAILY",
  rebalance: "daily",
  params: { ratioSma: 38, btcSma: 50 },
};

const BTC = "BTCUSDT";

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const btc = universe[BTC];
  if (!btc || btc.length < Math.max(p.btcSma, p.ratioSma)) return {};
  const nb = btc.length;
  let btcSum = 0;
  for (let k = nb - p.btcSma; k < nb; k++) btcSum += btc[k].close;
  const btcUp = btc[nb - 1].close > btcSum / p.btcSma;

  const holders = [];
  if (btcUp) {
    for (const sym of Object.keys(universe)) {
      if (sym === BTC) continue;
      const b = universe[sym];
      if (b.length < p.ratioSma) continue;
      // ratio series aligned from the end (every crypto bar ends on date t)
      let rSum = 0, rToday = 0;
      for (let m = 0; m < p.ratioSma; m++) {
        const r = b[b.length - 1 - m].close / btc[nb - 1 - m].close;
        rSum += r;
        if (m === 0) rToday = r;
      }
      if (rToday > rSum / p.ratioSma) holders.push(sym);
    }
  }

  const w = {};
  if (holders.length === 0) {
    if (btcUp) w[BTC] = 1;
    return w;
  }
  for (const sym of holders) w[sym] = 1 / holders.length;
  return w;
}
