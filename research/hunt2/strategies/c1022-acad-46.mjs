// c1022 acad chunk 3. Kaiser 2019, Finance Research Letters 31, 232-238; Lakonishok & Smidt 1988, RFS 1(4).
export const meta = {
  id: "c1022-acad-46",
  name: "Crypto year-end holiday drift: long all 18 from the Dec 24 close to the Jan 2 close (Kaiser)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "crypto",
  timeframe: "1d",
  assets: [
    "BTCUSDT", "BNBUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT", "LTCUSDT", "LINKUSDT", "TRXUSDT", "BCHUSDT",
    "ATOMUSDT", "ETCUSDT", "DASHUSDT", "ZECUSDT", "AVAXUSDT", "UNIUSDT", "NEARUSDT", "AAVEUSDT", "HBARUSDT",
  ],
  params: { from: "12-24", to: "01-01" },
};

// Position 1 when the bar's own UTC date is between from (MM-DD) and to (MM-DD), wrapping the year end.
export function signal(bars, i, ctx) {
  const md = new Date(bars[i].time * 1000).toISOString().slice(5, 10); // MM-DD, UTC
  const { from, to } = ctx.params;
  return md >= from || md <= to ? 1 : 0;
}
