// c1031 round-4 macro spec c1031-macro-25 (frozen in campaign-1031/prereg-macro.json).
// Source: Connors & Alvarez (2009) Short Term Trading Strategies That Work; Chen, Roll & Ross (1986) J. Business 59(3)

export const meta = {
  "id": "c1031-macro-25",
  "name": "Macro-driver pullback buying: RSI(5) under 30 in XLE, XLU, XLF or GLD only when its own macro driver is in a supportive 100-day trend",
  "family": "mean_reversion",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "XLE",
    "XLU",
    "XLF",
    "GLD"
  ],
  "params": {
    "rsiN": 5,
    "rsiMax": 30,
    "trendN": 100,
    "hold": 5
  },
  "holdBars": 5
};

// M(id,k) = value known by the close of bar i-k; null when i-k < 0 or no value yet.
// Oil values <= 5 count as null.
const M = (ctx, i, id, k) => {
  if (i - k < 0) return null;
  const v = ctx.macro(id, i - k);
  if (v === null) return null;
  if (id === "DCOILWTICO" && v <= 5) return null;
  return v;
};

// mean_N(id): average over k=0..N-1 (bar i included); null if any value is null.
const meanN = (ctx, i, id, n) => {
  let s = 0;
  for (let k = 0; k < n; k++) {
    const v = M(ctx, i, id, k);
    if (v === null) return null;
    s += v;
  }
  return s / n;
};

// Driver per asset. "gt": current value above its trailing mean. "lt": below.
const DRIVER = {
  XLE: { id: "DCOILWTICO", op: "gt" },
  XLU: { id: "DFII10", op: "lt" },
  XLF: { id: "T10Y2Y", op: "gt" },
  GLD: { id: "DFII10", op: "lt" },
};

export function signal(bars, i, ctx) {
  const { rsiN, rsiMax, trendN } = ctx.params;
  const d = DRIVER[ctx.symbol];
  if (!d) return 0;
  const cur = M(ctx, i, d.id, 0);
  const avg = meanN(ctx, i, d.id, trendN);
  if (cur === null || avg === null) return 0;
  const ok = d.op === "gt" ? cur > avg : cur < avg;
  return ok && ctx.rsi(rsiN, i) < rsiMax ? 1 : 0;
}
