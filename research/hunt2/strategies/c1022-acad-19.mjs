export const meta = {
  id: "c1022-acad-19",
  name: "Crypto 3-month time-series momentum, monthly check, long-only (MOP horizon test in crypto)",
  family: "trend",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: ["BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT", "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT"],
  params: { lookback: 90 },
};

function monthOf(t) {
  const d = new Date(t * 1000);
  return d.getUTCFullYear() * 12 + d.getUTCMonth();
}

// On the first bar of each UTC month, pos = 1 if the trailing lookback return is positive, else 0. Held until the next month start.
export function signal(bars, i, ctx) {
  const { lookback } = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  if (i > 0 && i >= lookback && monthOf(bars[i].time) !== monthOf(bars[i - 1].time)) {
    const r = bars[i].close / bars[i - lookback].close - 1;
    ctx.state.pos = r > 0 ? 1 : 0;
  }
  return ctx.state.pos;
}
