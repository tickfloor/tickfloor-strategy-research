# Tickfloor Strategy Research

Derived results from testing 1,083 trading strategies across 57 families against an equal-weight, daily-rebalanced hold of the same assets,
after Benjamini-Hochberg false-discovery-rate correction for running that many tests. Last
updated 24 October 2026 (ledger runs 15 September 2026 to 22 October 2026; the robustness and holdout reports are from 29 September).

**Result: 0 of 1,425 tests survived correction** (1,083 strategies plus reruns and variants). 217
strategies beat the benchmark on the raw number, and 28 of those cleared p < 0.05 before correction. The median strategy finished 8.8 points
a year behind the benchmark. The closest miss is a three-way tie at q = 0.3578: "60/40 with a duration-momentum bond sleeve (QQQ + TLT/IEF/SHY)"; "Volatility-managed QQQ with the remainder in AGG (2005+)"; "Crypto rank-weighted low BTC beta, monthly", above the ledger's q < 0.10 gate. The 2 candidates that then got a
single look at held-back data (after 2025-03-15) were both not confirmed.

Every backtest number here is in-sample, not a promise: it describes how each rule did on the discovery window, not what it will do next, and nothing in this repo
says a strategy, or the Tickfloor score, makes money.

This is the dataset behind [tickfloor.com/evidence](https://tickfloor.com/evidence). Tickfloor
is a paid stock and crypto testing tool, and this research is also marketing for it. Its maker ran this
study to check whether any of the standard trend/momentum/breadth/calendar-style strategies
actually beat holding the same assets, and published the negative result rather than burying it.

## What's in the data

`data/strategy-results.json` has one row per strategy (1,083 rows):

| field | meaning |
|---|---|
| `id` | strategy identifier |
| `family` | strategy family: trend, breadth, calendar, momentum, etc. (57 total) |
| `assetClass` | `us_stock`, `etf`, `crypto`, etc. |
| `excess` | annualized excess return vs. the benchmark (equal-weight, daily-rebalanced hold; pays no costs) |
| `p` | p-value on excess return, before correction |
| `q` | Benjamini-Hochberg FDR-adjusted q-value across all 1,425 tests |
| `verdict` | `yes` (beat benchmark, p < 0.05, pre-correction), `not significant`, or `no` |

`q` is computed over all 1,425 tests (reruns and variants included); each row shows the latest
run of its strategy, and a rerun of a rule can carry a different p and q than its first run. The lowest `q` in this file is 0.3578.

**Not included:** raw price bars. The underlying OHLC data comes from vendors whose terms
limit redisplay, so this dataset ships only the derived statistics per strategy: enough to
audit the correction and the verdicts, not enough to reconstruct the price history.

## Published reads ledger

`data/reads-ledger.csv` logs every score Tickfloor published, with what the price did afterwards. It has one row per read: 1,566 reads
published between 25 September 2026 and 22 October 2026, 1,235 of them with a finished 5-session outcome. It is the data behind
[tickfloor.com/results](https://tickfloor.com/results), pulled from the public feed that page reads, so you can check the page's numbers against the rows underneath.
It omits the newest 24 hours (the site holds each read back for a day before showing it), and it has no account, email or user columns.

| column | meaning |
|---|---|
| `id`, `permalink` | the read's number and its link on tickfloor.com/results |
| `published_at` | when the read was first published (UTC) |
| `symbol`, `market` | the asset and its market (`asx`, `crypto`, `us`) |
| `label` | the label the read carried (`WATCH` on every row) |
| `score` | the score, from -10 to 10 |
| `price`, `currency`, `quote_age_sec` | the price quoted when the read was published, and how old that quote was in seconds (blank on 681 rows, see below) |
| `bar_date` | the date of the last daily bar the score was computed from; the outcome horizons count sessions from this date |
| `bench_symbol` | the benchmark for that market (`BTCUSDT`, `IOZ.AX`, `SPY`) |
| `h1_*`, `h5_*`, `h20_*` | the outcome at session 1, 5 and 20 after `bar_date` |
| `hN_status` | `resolved`, `pending`, `missing_data` or `unavailable` |
| `hN_ret_from_price` | the close of session N divided by the published price, minus 1 |
| `hN_ret_from_open` | the close of session N divided by the open of session 1, minus 1 (session 1 has usually opened before the read is published, see below) |
| `hN_bench_ret_from_price` | the benchmark's close in session N divided by its close on `bar_date`, minus 1 |

**How sessions are counted.** Session N is the Nth trading session of the asset's own market after `bar_date` (crypto uses UTC calendar days).
Session 1 is the session right after the bar the score used, not the first session to open after the read was published. Most reads go out
after session 1 has already opened, so its open usually comes before the published price. For crypto, session 1 is the UTC day the read was
published on. `hN_ret_from_open` therefore starts from an open you could not have traded after seeing the read; `hN_ret_from_price` is the
move from the price the read quoted.

**Blank `quote_age_sec`.** The cell is blank on 681 of 1,566 rows, all in the `us` market: the feed has no timestamp for that quote, so its age is unknown (it is not zero).
`price` is filled on every row.

Returns are price-only: no dividends, fees or slippage. Rows with a status other than `resolved` have empty return cells. A read is a score
and what followed, not a trade. What happened after past reads is not a promise, and nothing here is advice or a claim that the score makes money.
`node scripts/export-reads-ledger.mjs` rebuilds the file from the public feed (Node 18 or newer, no credentials). It makes one request per 50 reads, one
second apart (about 32 requests today) and stops with an error rather than write a short file if it reaches 400 requests.

## Everything else in the repo

Under `research/`, generated from the same ledger:

| path | what |
|---|---|
| `research/STRATEGY-REGISTRY.json` | the generated registry: 1,083 strategies, excess, p, half-window excess, cost-sweep fields |
| `research/researchStats.ts` | headline numbers (1,083 strategies, 57 families, 1,425 FDR tests) emitted from the ledger |
| `research/hunt2/ledger.jsonl` | the append-only ledger of every run, with source/data/harness hashes |
| `research/hunt2/strategies/` | the source of all 1,524 strategy files, one rule each; signals are blocked from reading later bars |
| `research/hunt2/campaign-*/prereg-*.json` | the preregistered specs (9 files) that the October strategy files cite |
| `research/hunt2/harness.mjs`, `ledger.mjs`, `run.mjs`, `data.mjs` | the harness, BH-FDR ledger and runner |
| `research/hunt2/prereg-0929.md`, `robustness-0929.md`, `robustness-0929/` | pre-registration and the robustness battery on the top 20 (14 pass a weaker, separate test; a few distinct ideas, none is an edge) |
| `research/hunt2/holdout-exam-0929.md`, `.json` | the one-shot holdout exam: 2 candidates, 0 confirmed |
| `research/hunt2/cost-sweep.json`, `random-control-sweep.json` | cost-to-breakeven and random-control sweeps |
| `research/hunt2/scripts/` | registry, exam-stats and holdout-runner scripts |
| `scripts/export-reads-ledger.mjs` | rebuilds `data/reads-ledger.csv` from the public feed |

The harness needs price bars that are not redistributed here, so the scripts document the method
but will not run end to end from this repo alone.

## Method, in short

Each strategy is a fully specified rule (entry/exit or signal weighting) backtested over a
fixed discovery window (bars before 2025-03-15) with modelled costs (0.05% a side for stocks and ETFs, 0.10% plus measured slippage for
crypto; the benchmark pays none), scored on annualized excess return over the benchmark with a
block-bootstrap significance test. Because hundreds of independent tests inflate the
chance of a false positive, the p-values are corrected across the whole batch with
Benjamini-Hochberg FDR. `q` is the result of that correction, and `verdict` keeps track of
whether a strategy beat p < 0.05 on its own before the FDR step, so the effect of correction is
visible per strategy, not just in the headline count.

Limits: fills are at the signal bar close, which is optimistic; the stock universe is today's large
caps (survivorship bias); delisted stocks, shorting, leverage and options are not covered. Known accounting issue:
in rank-mode (portfolio-mode) strategies the harness held fixed target weights between decisions and charged turnover only at
decision points, so restoring drifted weights was free (accounting v1). From 7 October 2026 it charges that too (accounting v2;
`research/hunt2/CHANGELOG.md`, entry of 2026-10-07). Of the 487 portfolio-mode rows in the data file, 291 are v1 records and
196 were run under v2. This repo does not quantify the effect on the v1 rows. Like tickfloor.com/evidence, it treats every
rank-mode result, whichever version produced it, as a screening output and not a confirmation. The ledger itself is a screening statistic.
Preregistration files exist for batches from 24 September on (no third-party timestamp); the 15 to 23 September batches are exploratory.

Full method notes, scope and limits: [tickfloor.com/evidence](https://tickfloor.com/evidence).

## Using it

```python
import json
rows = json.load(open("data/strategy-results.json"))

survived = [r for r in rows if r["q"] < 0.05]  # 0
print(f"{len(survived)} of {len(rows)} survived FDR correction")

by_family = {}
for r in rows:
    by_family.setdefault(r["family"], []).append(r)
print(f"{len(by_family)} strategy families")
```

or with pandas: `pd.read_json("data/strategy-results.json")`, `pd.read_csv("data/reads-ledger.csv")`.

## License

- Code (`load_example.py`, `research/**/*.mjs`, `research/*.ts`, `scripts/*.mjs`): [MIT](LICENSE)
- Data and write-ups (`data/strategy-results.json`, `data/reads-ledger.csv`, `research/**/*.json`, `*.jsonl`, `*.md`): [CC BY 4.0](LICENSE-DATA). Reuse it, adapt it, and
  redistribute it, crediting Tickfloor Strategy Research and linking to this repository.
  The reads ledger omits the newest 24 hours of published reads.

## Citing

> Tickfloor Strategy Research (2026). 1,083 backtested trading strategies, FDR-corrected
> significance (updated 2026-10-24). https://github.com/tickfloor/tickfloor-strategy-research,
> derived from https://tickfloor.com/evidence.

`CITATION.cff` holds the same reference in machine-readable form (GitHub's "Cite this repository" reads it).
