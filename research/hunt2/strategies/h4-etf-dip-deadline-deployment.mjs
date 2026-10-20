// Spec: docs/research/hunt-1004/codex/specs.json (h4-etf-dip-deadline-deployment). Prereg: docs/research/hunt-1004/PREREG.md
export const meta = {
  "id": "h4-etf-dip-deadline-deployment",
  "name": "Does waiting briefly for dips improve dollar-cost averaging?",
  "family": "capital-deployment",
  "source": "retail trading content: dollar cost averaging dip deadline finite reserve investment timing",
  "assetClass": "etf",
  "timeframe": "1d",
  "assets": [
    "QQQ",
    "SHY"
  ],
  "longShort": false,
  "rebalance": "daily",
  "params": {
    "warmupBars": 2,
    "cycleCalls": 42,
    "tranches": 4,
    "blockCalls": 5,
    "deploymentCalls": 20,
    "flatCall": 41
  }
};

export function rank(universe, t, ctx) {
  const P = ctx.params, S = ctx.state;
  const q = universe.QQQ, h = universe.SHY;
  const ok = (b) => b && b.length >= 2 && [1, 2].every((k) => Number.isFinite(b[b.length - k].close) && b[b.length - k].close > 0);
  if (!ok(q) || !ok(h)) { S.age = undefined; return {}; }
  if (S.age === undefined) { S.age = 0; S.spent = 0; S.flags = [false, false, false, false]; }
  else S.age = (S.age + 1) % P.cycleCalls;
  const age = S.age;
  if (age === 0) { S.spent = 0; S.flags = [false, false, false, false]; }
  if (age === P.flatCall) return { SHY: 1 };
  if (age < P.deploymentCalls) {
    const b = Math.floor(age / P.blockCalls);
    if (!S.flags[b] && (q[q.length - 1].close <= q[q.length - 2].close || age % P.blockCalls === P.blockCalls - 1)) {
      S.spent++; S.flags[b] = true;
    }
  }
  const f = S.spent / P.tranches;
  const w = {};
  if (f > 0) w.QQQ = f;
  if (f < 1) w.SHY = 1 - f;
  return w;
}
