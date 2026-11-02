export const meta = {
  "id": "c1031-macro-13__rob1",
  "name": "Dollar-deflated oil above its 150-day mean: hold energy equities and commodity ETFs (-25%)",
  "family": "trend",
  "source": "c1031/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "XLE",
    "USO",
    "DBC"
  ],
  "params": {
    "window": 113
  }
};

// M(ctx, id, i, k): macro value known by the close of bar i-k, or null when there is no bar that far back.
function M(ctx, id, i, k) {
  return i - k < 0 ? null : ctx.macro(id, i - k);
}

export function signal(bars, i, ctx) {
  const n = ctx.params.window;
  let sum = 0;
  let q0 = null;
  for (let k = 0; k < n; k++) {
    const oil = M(ctx, "DCOILWTICO", i, k);
    const usd = M(ctx, "DTWEXBGS", i, k);
    if (oil === null || usd === null || oil <= 5) return 0;
    const q = oil / usd;
    if (k === 0) q0 = q;
    sum += q;
  }
  return q0 > sum / n ? 1 : 0;
}
