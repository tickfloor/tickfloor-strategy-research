export const meta = {
  "id": "c1022-macro-42",
  "name": "200d exit honoured only after a yield-curve inversion in the past year",
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
    "memory": 252
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// 200d exit honoured only after a yield-curve inversion within the last `memory` bars (signal mode, ETF).
export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.lastInv === undefined) ctx.state.lastInv = -1000000000;
  const y = ctx.macro("T10Y2Y", i);
  if (y !== null && y < 0) ctx.state.lastInv = i;
  const inverted = i - ctx.state.lastInv < p.memory;
  const s = ctx.sma("close", p.sma, i);
  if (Number.isNaN(s)) return 1;
  return bars[i].close > s || !inverted ? 1 : 0;
}
