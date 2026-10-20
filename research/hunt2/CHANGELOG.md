# hunt2 harness changelog

## 2026-10-11: meta.warmup in rank (portfolio) mode

`meta.warmup` is now accepted on rank strategies: the first `warmup` days of the universe calendar are scored for neither
the rule nor the equal-weight benchmark, and turnover, rebalance and exposure counts start after it too. Weights chosen
during warm-up carry into day W+1. Signal mode is unchanged (bit-identical returns), but `harnessSha256` moved, so every
`cache/series/a2/` record was re-extracted. Test: `harness.test.mjs` (synthetic two-asset rank strategy). First users:
t1011-minervini-tt-s and its control (docs/research/tests-1011/prereg.md, amendment 2026-10-11 late).

## 2026-10-07: portfolio accounting v2, full data hash, causal cost tiers, log-excess units

`ACCOUNTING_VERSION = 2` (`accounting.mjs`): portfolio-mode holdings drift between rebalances and every rebalance (including
restoring drift) plus the final liquidation pays on traded notional, self-financing. v1 held target weights constant daily
for free (fixture: +12.5% where fixed holdings return 0). `dataSha256` now hashes every bar and served extras value;
the old endpoint summary is `dataSummarySha256` and stays the ledger's test identity. Reality-check series live in
`cache/series/a2/` with a code/accounting/data identity; stale records are skipped. Cost maps accept a per-symbol function
of the fill time (portfolio mode). `annualLogExcessUnits()` separates relative growth from pp CAGR gaps. Benchmark unchanged
(see the amendment's open issue). Rationale, sample magnitudes and the regeneration list:
`docs/research/amendments/2026-10-07-accounting.md`. Existing results/ledger rows are v1 records (no `accountingVersion`).

## 2026-10-06 (B): random control v3, one shared time rotation per copy

**Root cause of the coin-flip miscalibration logged below.** The harness loads a fresh strategy module per asset, so
the sweep's seeded coin flip gives every asset the same position at the same bar index. All 40 US stocks start on
2016-09-14 (2,136 or 2,137 bars), so their positions were identical in calendar time: one timing bet on 40 correlated
names. v2 placed each asset's copy independently, which diversified that bet away, so the copies were far narrower
than the rule and both tails were fat (US stocks 27/100 at or above 95%, 38/100 under 5%). The same 300 rules with
timing independent per asset were calibrated under v2 (12/300 at or above 95%). Real rules on correlated assets
(trend and crossover rules on 40 stocks or 8 crypto pairs) share timing the same way. Drift, non-trading days, fees,
ties, copy count and survivorship were checked and ruled out (amendment B, section 1).

**Fix.** `CONTROL_VERSION = 3`, `rotatedPositions`: each copy is the rule's own position series rotated in time by one
shift per seed shared by every asset (`tau = (0.05 + 0.9 u) * median window span`, `u` the first draw of the unchanged
seed), each asset rotating inside its own [first entry, n-1) window. Exposure and every position value are exact;
the wrap seam can move the trade count by one per asset (asserted). `fallbackShare` is gone (no fallback).
`harness.test.mjs` checks exposure, the seam bound and that identical timing stays identical and calendar-aligned.
Pre-registered in `docs/research/trending-1005/prereg-amendment-2026-10-06b.md` before any registered run.

**Calibration (registered, real harness).** `random-control-sweep.json` (same timing on every asset): 21/300 at or
above 95% (7.0%, Wilson 95% CI 4.6-10.5%), 13/300 under 5% (4.3%, CI 2.5-7.3%); US stocks 6 and 2 of 100 (was 27 and
38). New `random-control-sweep-per-asset.json` (`--per-asset`, timing independent per asset): 16/300 (5.3%, CI 3.3-8.5%)
and 22/300 (7.3%, CI 4.9-10.9%). Every interval contains 5%: the pass bar in the amendment is met.

**Re-run (`scripts/research/control-v2-rerun.mjs`, now version-generic; report `control-v3-rerun.json`).** 388 attempted,
303 reproduced exactly and got a v3 ledger row, 85 skipped for the same cache drift as under v2. 242 percentiles moved
(137 up, 105 down); at or above 95%: 92 -> 85, under 5%: 50 -> 36 (the tails shrank, as a wider control should). 11
crossed 95% (listed in the report). No FDR verdict changed: 722 tests, 0 passed, min q 0.1444. Trending cells
(`results-amended-2026-10-06b.json`): tr5-ema921-1h-both 97.5 -> 95.5 (still clears the 95% gate, narrowly),
tr5-ema921-daily-stocks 4.0 -> 29.5, tr5-crypto-200dma-30d 22.5 -> 54.0, tr5-crypto-golden-cross 3.0 -> 38.0,
matched cells 43.0 -> 65.5 and 2.5 -> 40.0, tr5-crypto-uptober 78.0 -> 70.0.

**Not changed.** Portfolio-mode control (keeps the rule's rebalance dates). `harness-battery.mjs` keeps its own
v1-style per-asset shuffle; anything published from it has the same exposure to shared timing.

## 2026-10-06: random control v2 (trade-count and turnover preserving), meta.warmup, re-run counting

**Root cause.** `shuffledPositions` placed the rule's shuffled trades with gaps that could be zero, so two
same-direction copies could touch. `segments()` and the cost model then saw one trade: the exit and re-entry
fees between them were never charged. Copies had fewer trades and lower costs than the rule, which biased every
signal-mode random percentile downward (worst for frequent, short-gap and always-in rules). Found by both
trending-1005 reviews (`docs/audits/2026-10-06-*-trending-review.md`, finding 1).

**Fix.** Control v2 (`CONTROL_VERSION = 2`, recorded as `randomControl.version` and the ledger's
`randomControlVersion`). Each copy places the rule's trades in a fully shuffled order (redrawn up to 100 times
until same-direction neighbours fit), with at least one flat bar between same-direction neighbours. A
near-always-in long/short rule with no room falls back to its own direction order with lengths shuffled within
each direction; `randomControl.fallbackShare` records how often. (A first draft always kept the rule's direction
order; on long/short rules with spare flat bars that leaked the rule's timing into the copies, so it was replaced
before any registered run. Null check on the fallback path: docs/research/trending-1005/control-v2-null-check.json,
3 of 40 random always-in rules beat 95%.) Trade count, lengths, directions, exposure
and turnover equal the rule's on every seed. `runSignalMode` asserts the count per seed and asset, and
`harness.test.mjs` runs the reviewers' six-trade counterexample (it fails on v1). Seeds are unchanged. The
portfolio control is unchanged. `METRICS_VERSION` stays 2: no return metric or p-value changed.

**Re-run (2026-10-06, `scripts/research/control-v2-rerun.mjs`, report in `control-v2-rerun.json`).** 385 signal-mode
registry runs attempted; 300 reproduced their archived data, p and CAGR exactly and got a v2 ledger row; 85 were
skipped because today's cache no longer hashes to their archived data (they keep their v1 percentiles). 206 of the
300 percentiles moved (122 up, 84 down, median shift 0, 20 by 5 points or more). Six crossed 95%:
tr5-ema921-1h-both 19.5 -> 97.5, social-ta-engulfing-reversal 92 -> 95, s29-etf-fng-momentum-tech 93.5 -> 95,
carry6-drop-control 96 -> 93.5, s29-h-breakout-retest 96.5 -> 93.5, h4-cd-volume-burst-adjacency 95.5 -> 93. No
FDR verdict changed: 722 tests (719 + 3 amendment cells), 0 promising, 0 risk improvers, min q 0.1444. The coin-flip
sweep (`random-control-sweep.json`) moved from 41 to 46 of 300 beating 95% (63 -> 59 under 5%). That is still about
three times the nominal 15, concentrated in us_stock (27 of 100 beat 95%, 38 under 5%; crypto 10, ETF 9): the
control is over-dispersed on the US stock universe under v1 and v2 alike. Not investigated here; open.

**Counting.** `computeLedger` de-duplicates on `sourceSha256|dataSha256` (it used to add `harnessSha256`), so a
corrected re-run of the same source on the same data replaces its row instead of adding a test. Same 759 runs on
the ledger at 8ba972a5 under either key.

**meta.warmup.** New signal-mode option: the first `warmup` bars of each asset are scored for neither the rule nor
the benchmark (signals and the lookahead check still run on the full history). Used by the trending-1005
amendment's matched 200-day cells.

**seedRs.** `evaluate(..., { keepSeries: true })` now returns the 200 control series (`seedRs`), so the
trending runner no longer patches a runtime copy of the harness.

## 2026-09-27: Sharpe bootstrap refine 20000 -> 100000

The selftest "bootstrap p-value floors stay >=5x under the BH bar" failed at nTests=414: the Sharpe-difference
test (RISK_IMPROVER track only) refines at 20000 iterations, a floor of 5.0e-5 against a rank-1 bar of 2.4e-4
(4.8x, needs 5x). Raised `sharpeDiffPValue`'s `refineIters` default to 100000 (floor 1.0e-5, good to ~2000 tests).
Refinement only runs when the screen p <= 0.02, so rows above that are unchanged. The excess test (PROMISING
track) already refines at 50000 (floor 2e-5) and is unaffected.

## v2 — 2026-09-15 (between round 1 and round 2)

### 1. Metrics made internally consistent (changes every past row)

**Root cause.** v1 mixed two kinds of annualisation:
- `CAGR` and `B&H CAGR` were geometric: (prod(1+R))^(1/years) − 1.
- `excess/yr` and the halves were **arithmetic**: mean(R_daily − B_daily) × days-per-year.
- The p-value bootstrapped the same arithmetic daily difference.

For crypto, whose daily vol runs 4–5%, the arithmetic mean of B&H sits far above its geometric CAGR (volatility drag ≈ σ²/2 per day).
- **A zero-trade strategy** scored excess = −mean(B)×365 = **−86.8%/yr**, while B&H CAGR was 62.8%. Half 1 (2017–2021) came out at **−145.2%**
  because that half's arithmetic mean return was 145%/yr. Neither number is a real return anyone could lose.
- **social-ta-vwma-cross** (CAGR 86.0% vs 62.8%) showed excess **−13.2%**. It holds only part of the time, so it
  pays much less volatility drag. Its arithmetic mean was below B&H's arithmetic mean even though its compounded growth
  was higher. The p-value tested that same arithmetic statistic, so it asked a different question from the CAGR column.

**Fix.** Everything is geometric and tested on log returns (definitions at the top of `harness.mjs`):
- `excess/yr = CAGR(strategy) − CAGR(buy&hold)` on identical days, in percentage points. Cash = −B&H CAGR exactly, and a
  B&H copy = 0 exactly. The halves use the same formula per half. Folds now report period `excessReturn` (strategy return − B&H return), not an annualised figure.
- `p` bootstraps daily `log(1+R) − log(1+B)`. That mean is > 0 exactly when CAGR(strategy) > CAGR(B&H), so the p-value and excess/yr always agree in sign (the selftest checks 100 runs).
- The random-control statistic is now mean daily log return (it ranks like CAGR), and there's a Sharpe percentile alongside it.
- The benchmark is documented as what it has always been: an equal-weight long of the same assets, **rebalanced daily** across the assets trading that day.
  The strategy's daily return uses the same construction. It is not a per-asset buy-and-hold mean (`perAsset.bhReturn` is that).
- Selftest: B&H-identical excess = 0 (whole run and both halves). Cash excess = −B&H CAGR (whole run and both halves). B&H CAGR matches an
  independent geometric calculation.

### 2. Ledger hygiene

**Root cause.** Round 1 had 40 of 115 rows with fewer than 5 trades (39 with zero). They were ledgered as tests, and repeated attempts at the same broken id piled up
(williams-r ×10, livermore ×5, vantharp ×5, 3-white-soldiers ×4, darvas ×4). calendar-crypto-hour-of-day never reached the ledger because it timed out. Two shared author bugs:
- `if (!ctx.state) ctx.state = {...}`. `ctx.state` is always `{}`, so its fields stayed `undefined` and no entry condition could ever be true (williams-r).
- Treating `bar.time` (epoch seconds) as milliseconds (calendar-crypto-hour-of-day divides by 1000).

**Fix.**
- `evaluate()` now REJECTS any run with <5 trades (signal: trade segments; portfolio: weight changes) **before** the random control, so nothing is ledgered.
  The message names the common bugs. README and the template now document both pitfalls.
- `computeLedger` drops <5-trade rows from old ledgers. The BH family is still every distinct run that traded (every attempt counts).
  The leaderboard shows the latest run per id plus its attempt count (`--all` shows every run).
- Each ledgered run now stores its exact source at `results/sources/<sha256>/<id>.mjs`. Round 1 only kept the latest file per id, so older attempts could not be recomputed.

### 3. RISK_IMPROVER track

Separate from PROMISING, and never called an edge. It needs all of:
- q<0.10 (BH over the whole ledger) on a one-sided, centred, paired circular block bootstrap of Sharpe(R) − Sharpe(B), with the same block length as the excess test
- Sharpe > B&H
- maxDD ≤ 75% of B&H's
- CAGR ≥ 60% of B&H's
- Sharpe better in both halves
- ≥2 assets
- beats ≥95% of exposure-matched random controls on Sharpe

A row that is PROMISING is reported on track 1 only.
Selftest: calibration on 100 synthetic nulls and 100 random strategies on real data; power on a half-vol benchmark copy; each gate individually; BH across 2001 rows.

### 4. Data expansion

Keyless, cached in `cache/extras/`, cut at DISCOVERY_END, and every value keyed by the time it became known. See the README "Data available" table.
- FRED series: T10Y2Y, BAMLH0A0HYM2, DFII10, T10YIE, DCOILWTICO, DTWEXBGS, VIXCLS
- CBOE VIX and VIX3M
- Fear & Greed
- USDT-M funding for all 18 crypto dailies (data.binance.vision, 2020+). This is merged with the legacy BTC/BNB cache, which it matches on all 4,560 overlapping settlements.
- Hourly open interest for the 8 crypto-1h pairs

Lags:
- FRED/CBOE daily prints: D+1
- DCOILWTICO and DTWEXBGS: D+7, because they arrive in weekly releases
- F&G: unchanged

Caveats:
- BAMLH0A0HYM2 only covers 2023-09+ because FRED limits ICE data to 3 years.
- FRED values are the current vintage.

New ctx calls: `ctx.macro(id, i)`, `ctx.openInterest()`, and `ctx.resample(bars, "1w"|"1M")`. Macro and resample are also available in `rank()`.
The extras a run actually reads now enter `dataSha256`.
The INDEX_PROXY rule adds `meta.proxyFor`: SPY/IWM/EFA → QQQ/DIA only, the proxy must be one of the assets, and the swap is recorded in `result.substitutions` and in the ledger.

### 5. Performance

**Root cause.** calendar-crypto-hour-of-day re-scanned a 17,520-bar window through the lookahead Proxy on every one of 66k hourly bars,
three times over (full run plus two truncation re-runs): ~3.5e9 guarded reads.

**Fix.** Memoised O(1)-per-bar ctx helpers:
- `sma`/`rollingMean`, `rollingSum`, `rollingStd`, `ema`, `rsi`, `atr`, `donchian`
- a push-based `rolling(n)` window for custom series

A NaN input resets a window rather than poisoning a running sum, and sums are re-derived every n pushes to stop float drift.
Selftest: 9 indicators over all 66,276 BTC 1h bars in ~0.4s, each matching a naive implementation at 4 probes including the last bar.
An hour-of-day strategy rewritten on `ctx.rolling` runs through the full harness in ~2s.
The truncation check now runs after the trade-count check, and it still compares raw signals.

### Recompute of round-1 rows

`node --import tsx research/hunt2/ledger.mjs --recompute` (3 shards, then assembly). The v1 ledger is preserved at `ledger.v1.jsonl`.
Every distinct source in v1 (115) was handled one of four ways:
- **72 recomputed** from a stored source. `ranAt` is kept, `recomputedAt` is added, and the v2 metrics, Sharpe test and random Sharpe percentile are filled in.
  Only these can be reproduced, because round 1 kept just the latest file per id. Their source snapshots now live under `results/sources/`.
- **4 now rejected** (<5 trades) and removed from the ledger: social-ta-fibonacci-618-retrace, mrsa-btc-eth-ratio-reversion,
  mrsa-ou-halflife-pair-crypto, calendar-turn-of-month@a5917fa6.
- **36 dropped**: older attempts with <5 trades whose source was overwritten, all implementation failures.
- **3 kept as LEGACY**: older attempts that did trade but whose source was overwritten. They still count in both FDR families,
  keep their v1 p (and p=1 on the Sharpe track), and can never be marked PROMISING or RISK_IMPROVER.

The FDR family went from 115 rows to 75 distinct runs that traded, across 72 ids. The metric change only touches excess/yr, the halves, the p-values and the random percentiles. CAGR, Sharpe and maxDD formulas are the same
(strategies that read funding now also see the 2020 funding history, so their numbers can move too). That includes the v1 examples above:
- vwma-cross is now +23.2pp (was −13.2%)
- mom12_1_stocks is p=0.137 (was 0.054)

Nothing is PROMISING and nothing is RISK_IMPROVER (see the ledger).
