export const meta = {
  id: "c1031-tjr-28",
  name: "Dual-index structure alignment: hold QQQ+DIA only while both show HH/HL structure (ETF 1d, TJR's ES/NQ gate)",
  family: "index_alignment",
  source: "c1031/tjr",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["QQQ", "DIA"],
  rebalance: "daily",
  longShort: false,
  params: { k: 2 },
};

// UP = last two confirmed daily swing highs rising AND last two confirmed swing lows rising.
// Swing k=2: bar j confirmed at the close of bar j+2, so only j+2 <= last bar is used.
function isUp(b) {
  const L = b.length - 1;
  const sh = [], sl = [];
  for (let j = 2; j + 2 <= L; j++) {
    const h = b[j].high, l = b[j].low;
    if (h > b[j - 2].high && h > b[j - 1].high && h > b[j + 1].high && h > b[j + 2].high) sh.push(h);
    if (l < b[j - 2].low && l < b[j - 1].low && l < b[j + 1].low && l < b[j + 2].low) sl.push(l);
  }
  const n = sh.length, m = sl.length;
  if (n < 2 || m < 2) return false;
  return sh[n - 1] > sh[n - 2] && sl[m - 1] > sl[m - 2];
}

export function rank(universe, t, ctx) {
  const q = universe.QQQ, d = universe.DIA;
  if (q === undefined || d === undefined) return {};
  if (isUp(q) && isUp(d)) return { QQQ: 0.5, DIA: 0.5 };
  return {};
}
