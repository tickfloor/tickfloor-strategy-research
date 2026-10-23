export const meta = {
  "id": "c1022-macro-41",
  "name": "200d trend with a VIX-scaled hysteresis band",
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
    "bandPerVix": 0.01,
    "vixRef": 15
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// 200d trend with VIX-scaled hysteresis band (signal mode, ETF). Band b = bandPerVix * VIX / vixRef (null VIX -> bandPerVix).
export function signal(bars, i, ctx) {
  const p = ctx.params;
  if (ctx.state.pos === undefined) ctx.state.pos = 0;
  const vix = ctx.macro("VIX", i);
  const b = vix === null ? p.bandPerVix : (p.bandPerVix * vix) / p.vixRef;
  const s = ctx.sma("close", p.sma, i);
  if (Number.isNaN(s)) return 0;
  const c = bars[i].close;
  if (ctx.state.pos === 0 && c > s * (1 + b)) ctx.state.pos = 1;
  else if (ctx.state.pos === 1 && c < s * (1 - b)) ctx.state.pos = 0;
  return ctx.state.pos;
}
