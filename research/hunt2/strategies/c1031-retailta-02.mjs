// Spec: research/hunt2/campaign-1031/prereg-retailta.json (c1031-retailta-02). Le Beau & Lucas, Computerized Trading (1992), chandelier exit; ratcheting form.
export const meta = {
  id: "c1031-retailta-02",
  name: "Chandelier Exit flip (LeBeau 22/3): long when the ratcheting ATR stop system turns long",
  family: "trend",
  source: "c1031/retailta",
  assetClass: "us_stock",
  timeframe: "1d",
  assets: ["AAPL", "NVDA", "AMZN", "GOOGL", "META", "TSLA", "JPM", "V", "UNH", "XOM", "JNJ", "COST", "ABBV", "MRK", "AVGO", "CVX", "WMT", "BAC", "ORCL", "ADBE", "CRM", "NFLX", "AMD", "INTC", "ABT", "MCD", "DIS", "QCOM", "TXN", "HON", "CAT", "LOW", "SBUX", "BA", "UPS", "PFE", "T", "MDT", "UNP", "MMM"],
  params: { n: 22, mult: 3 },
};

export function signal(bars, i, ctx) {
  const { n, mult } = ctx.params;
  const st = ctx.state;
  if (st.pos === undefined) { st.pos = 0; st.dir = 0; st.started = false; }
  const d = ctx.donchian(n, i);
  const a = ctx.atr(n, i);
  const rawLong = d.upper - mult * a;
  const rawShort = d.lower + mult * a;
  if (!Number.isFinite(rawLong) || !Number.isFinite(rawShort)) return st.pos;
  if (!st.started) { st.started = true; st.ls = rawLong; st.ss = rawShort; return st.pos; }
  const c = bars[i].close;
  const prevC = bars[i - 1].close;
  // dir[i] uses the stops of bar i-1
  const dirPrev = st.dir;
  let dir = dirPrev;
  if (c > st.ss) dir = 1;
  else if (c < st.ls) dir = -1;
  if (dir === 1 && dirPrev !== 1) st.pos = 1;
  else if (dir === -1 && dirPrev !== -1) st.pos = 0;
  st.dir = dir;
  // ratchet the stops for bar i
  let ls = rawLong;
  if (prevC > st.ls) ls = Math.max(rawLong, st.ls);
  let ss = rawShort;
  if (prevC < st.ss) ss = Math.min(rawShort, st.ss);
  st.ls = ls;
  st.ss = ss;
  return st.pos;
}
