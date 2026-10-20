// top100-1006 (lane z2). Pre-registered in docs/research/top100-1006/prereg.md before any run.
export const meta = {
  "id": "t100-sma200-s",
  "name": "Close above the 200-day average, long only (US stocks 1d x40)",
  "family": "top100-1006",
  "source": "Faber / '200-day moving average' content; r/CryptoCurrency and r/stocks 200DMA threads; stock version of the tested crypto cell",
  "assetClass": "us_stock",
  "timeframe": "1d",
  "longShort": false,
  "params": {
    "n": 200
  },
  "warmup": 199
};

export function signal(bars, i, ctx) {
  const P = ctx.params, s = ctx.state, b = bars[i];
  const m = ctx.sma("close", P.n);
  return m === m && b.close > m ? 1 : 0;
}
