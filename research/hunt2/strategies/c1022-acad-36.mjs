// c1022 acad chunk 3. Birru 2018, JFE 130(1), 182-214 (day-of-week lottery tilt).
export const meta = {
  id: "c1022-acad-36",
  name: "Day-of-week lottery tilt: short high-vol/long low-vol into Monday, reverse into Friday (Birru)",
  family: "seasonality",
  source: "c1022/acad",
  assetClass: "us_stock",
  timeframe: "1d",
  universe: "US_STOCKS_WIDE",
  rebalance: "daily",
  longShort: true,
  params: { volBars: 60, frac: 0.2, legWeight: 0.5 },
};

const DAY = 86400;
function dowOf(t) { return (Math.floor(t / DAY) + 4) % 7; }

export function rank(universe, t, ctx) {
  const { volBars, frac, legWeight } = ctx.params;
  const dw = dowOf(t); // 5 = Friday bar (held into Monday), 4 = Thursday bar (held into Friday)
  if (dw !== 4 && dw !== 5) return {};
  const scores = [];
  for (const sym of Object.keys(universe)) {
    const b = universe[sym];
    if (b.length <= 70) continue;
    const rs = [];
    for (let k = b.length - volBars; k < b.length; k++) rs.push(b[k].close / b[k - 1].close - 1);
    const mean = rs.reduce((a, x) => a + x, 0) / rs.length;
    const v = rs.reduce((a, x) => a + (x - mean) ** 2, 0) / (rs.length - 1);
    if (Number.isFinite(v)) scores.push([sym, Math.sqrt(v)]);
  }
  const n = Math.floor(scores.length * frac);
  if (n < 3) return {}; // default rule: N >= 3 per leg else cash
  scores.sort((a, b) => a[1] - b[1] || (a[0] < b[0] ? -1 : 1));
  const L = scores.slice(0, n); // lowest vol
  const H = scores.slice(-n);   // highest vol
  const longs = dw === 5 ? L : H;
  const shorts = dw === 5 ? H : L;
  const w = {};
  for (const [sym] of longs) w[sym] = legWeight / n;
  for (const [sym] of shorts) w[sym] = -legWeight / n;
  return w;
}
