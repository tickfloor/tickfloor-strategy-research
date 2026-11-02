// Spec: research/hunt2/campaign-1031/prereg-acad4.json (c1031-acad4-05). Source: Brock, Lakonishok & LeBaron 1992, Journal of Finance 47(5), 1731-1764; Gerritsen, Bouri, R
export const meta = {
  id: "c1031-acad4-05",
  name: "Brock-Lakonishok-LeBaron trading-range break on crypto: close 1% above the 50-day closing high, exit 1% below the 50-day closing low",
  family: "trend",
  source: "c1031/acad4",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  longShort: false,
  params: { L: 50, band: 0.01 },
};

export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  if (i < p.L + 1) return 0;
  let R = -Infinity, Sp = Infinity;
  for (let k = i - p.L; k <= i - 1; k++) {
    if (bars[k].close > R) R = bars[k].close;
    if (bars[k].close < Sp) Sp = bars[k].close;
  }
  const c = bars[i].close;
  if (ctx.state.pos === 0) {
    if (c > (1 + p.band) * R) ctx.state.pos = 1;
  } else if (c < (1 - p.band) * Sp) {
    ctx.state.pos = 0;
  }
  return ctx.state.pos;
}
