export const meta = {
  "id": "c1022-macro-39",
  "name": "Financial-conditions z-score ladder (full / half / zero)",
  "family": "macro",
  "source": "c1022/macro",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "DIA"
  ],
  "rebalance": "daily",
  "proxyFor": {
    "SPY": "QQQ"
  },
  "params": {
    "lookback": 63,
    "z": 252
  }
};

// c1022 macro chunk 3 (spec: campaign-1022/prereg-macro.json, frozen before code). Rule per spec `rule`.
// Financial-conditions z-score ladder (rank mode, daily). Components a=VIX, b=chg DTWEXBGS, c=chg DFII10, d=-T10Y2Y.
// Each z vs its own trailing window of known values (ctx.rolling kept in state). Any z not ready -> FILL 1/k.
function recordMacro(ctx, id) {
  const key = "m_" + id;
  if (ctx.state[key] === undefined) ctx.state[key] = [];
  ctx.state[key].push(ctx.macro(id));
  return ctx.state[key];
}
function chgCalls(arr, s) {
  const last = arr.length - 1;
  if (last - s < 0) return null;
  const a = arr[last];
  const b = arr[last - s];
  if (a == null || b == null) return null;
  return a - b;
}

function basket(universe, syms, total) {
  const present = syms.filter((s) => universe[s]);
  const w = {};
  for (const s of present) w[s] = total / present.length;
  return w;
}

export function rank(universe, t, ctx) {
  const p = ctx.params;
  const a = recordMacro(ctx, "VIX");
  const b = recordMacro(ctx, "DTWEXBGS");
  const c = recordMacro(ctx, "DFII10");
  const d = recordMacro(ctx, "T10Y2Y");
  const dLast = d[d.length - 1];
  const comps = [
    a[a.length - 1],
    chgCalls(b, p.lookback),
    chgCalls(c, p.lookback),
    dLast == null ? null : -dLast,
  ];
  const zs = [];
  for (let k = 0; k < 4; k++) {
    const key = "z" + k;
    if (ctx.state[key] === undefined) ctx.state[key] = ctx.rolling(p.z);
    const w = ctx.state[key];
    const x = comps[k];
    let z = null;
    if (x !== null) w.push(x); // trailing 252 known values, current included
    if (x !== null && w.full()) {
      const sd = w.std();
      if (sd > 0) z = (x - w.mean()) / sd;
    }
    zs.push(z);
  }
  if (zs.some((z) => z === null)) return basket(universe, ["QQQ", "DIA"], 1);
  const fci = (zs[0] + zs[1] + zs[2] + zs[3]) / 4;
  const held = ["QQQ", "DIA"].filter((s) => universe[s]);
  const w = {};
  if (held.length === 0) return w;
  if (fci < 0) for (const s of held) w[s] = 1 / held.length;
  else if (fci < 1) for (const s of held) w[s] = 0.5 / held.length;
  return w;
}
