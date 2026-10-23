export const meta = {
  id: "c1022-acad-17",
  name: "Bond dual momentum: best of HYG/LQD/TLT by 12-month return, held only if it beats SHY (Antonacci)",
  family: "momentum",
  source: "c1022/acad",
  assetClass: "etf",
  timeframe: "1d",
  assets: ["HYG", "LQD", "TLT", "SHY"],
  rebalance: "monthly",
  params: { lookback: 252 },
};

// Relative step: winner = argmax 12-month return over HYG, LQD, TLT. Absolute step: hold the winner only if it beats SHY, else SHY.
export function rank(universe, t, ctx) {
  const { lookback } = ctx.params;
  const need = ["HYG", "LQD", "TLT", "SHY"];
  for (const s of need) if (!universe[s] || universe[s].length <= lookback + 1) return {};
  const r = (s) => {
    const b = universe[s];
    return b[b.length - 1].close / b[b.length - 1 - lookback].close - 1;
  };
  let win = "HYG";
  for (const s of ["LQD", "TLT"]) if (r(s) > r(win)) win = s;
  return r(win) > r("SHY") ? { [win]: 1 } : { SHY: 1 };
}
