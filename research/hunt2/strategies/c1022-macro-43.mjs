export const meta = {
  "id": "c1022-macro-43",
  "name": "200d exit honoured only while the broad dollar is rising",
  "family": "trend",
  "source": "c1022/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "XLK",
    "XLF",
    "XLE",
    "XLV",
    "XLI",
    "XLP",
    "XLY",
    "XLU",
    "XLB",
    "XLC",
    "VNQ",
    "QQQ",
    "DIA"
  ],
  "params": {
    "sma": 200,
    "lookback": 63
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// 200d exit honoured only while the broad dollar is rising over `lookback` bars (signal mode, ETF).
function chg(ctx, id, i, n) {
  if (i - n < 0) return null;
  const a = ctx.macro(id, i);
  const b = ctx.macro(id, i - n);
  if (a == null || b == null) return null;
  return a - b;
}

export function signal(bars, i, ctx) {
  const p = ctx.params;
  const dc = chg(ctx, "DTWEXBGS", i, p.lookback);
  const dollarUp = dc !== null && dc > 0;
  const s = ctx.sma("close", p.sma, i);
  if (Number.isNaN(s)) return 1;
  return bars[i].close > s || !dollarUp ? 1 : 0;
}
