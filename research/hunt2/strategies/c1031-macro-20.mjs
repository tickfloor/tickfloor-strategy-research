export const meta = {
  "id": "c1031-macro-20",
  "name": "Crypto fear as a contrarian entry for tech equities: buy QQQ, XLK, DIA, XLY and XLF when the Fear & Greed index is 24 or less, hold 20 bars",
  "family": "sentiment",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "XLK",
    "DIA",
    "XLY",
    "XLF"
  ],
  "holdBars": 20,
  "params": {
    "fearMax": 24,
    "hold": 20
  }
};

export function signal(bars, i, ctx) {
  const f = ctx.macro("FNG", i);
  return f !== null && f <= ctx.params.fearMax ? 1 : 0;
}
