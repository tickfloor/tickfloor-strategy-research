// c1031 round-4 macro spec c1031-macro-27 (frozen in campaign-1031/prereg-macro.json).
// Source: Bruno & Shin (2015) Capital flows and the risk-taking channel of monetary policy, J. Monetary Economics 71; Akram (2009) Energy Economics 31(6)

export const meta = {
  "id": "c1031-macro-27",
  "name": "Dollar-surge exhaustion: after the broad dollar rises 2% in 20 bars, short UUP and long GLD, SLV, DBC, USO for 20 bars",
  "family": "macro",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "UUP",
    "GLD",
    "SLV",
    "DBC",
    "USO"
  ],
  "params": {
    "surge": 0.02,
    "lag": 20,
    "hold": 20
  },
  "holdBars": 20,
  "longShort": true
};

// M(id,k) = value known by the close of bar i-k; null when i-k < 0 or no value yet.
const M = (ctx, i, id, k) => (i - k < 0 ? null : ctx.macro(id, i - k));

export function signal(bars, i, ctx) {
  const { surge, lag } = ctx.params;
  const d0 = M(ctx, i, "DTWEXBGS", 0);
  const dl = M(ctx, i, "DTWEXBGS", lag);
  if (d0 === null || dl === null) return 0;
  const trigger = d0 / dl - 1 >= surge;
  if (!trigger) return 0;
  return ctx.symbol === "UUP" ? -1 : 1;
}
