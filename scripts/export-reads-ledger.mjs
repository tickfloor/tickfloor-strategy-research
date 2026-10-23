// Exports Tickfloor's published-reads ledger to CSV from the PUBLIC feed behind tickfloor.com/results.
// No database access, no credentials, no account data: only what that page already shows.
//
//   node scripts/export-reads-ledger.mjs [out.csv]      default ./data/reads-ledger.csv
//   node scripts/export-reads-ledger.mjs --selftest     pages an in-process stub, asserts the CSV
//
// The feed omits reads younger than 24 hours (the site's embargo), pages 50 at a time by `cursor`,
// and is rate limited, so this makes one request per 50 reads (a run is about reads / 50 requests), one second apart,
// and never more than MAX_REQUESTS.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

// Safety cap, not a target: 400 requests is 20,000 reads at 50 a page (the feed held 1,531 reads on 24 Oct and grows about 52 a day).
// The loop stops at the end of the feed; hitting the cap makes the run fail loudly instead of writing a short file.
export const MAX_REQUESTS = 400;
const HORIZONS = [1, 5, 20];
// An explicit allow-list: a column added to the feed later is NOT exported until it is added here on purpose.
// Same columns as the CSV button on /results, plus the benchmark move so that page's "Benchmark move" can be recomputed.
export const COLUMNS = [
  "id", "published_at", "symbol", "market", "label", "score", "price", "currency", "quote_age_sec", "bar_date", "bench_symbol",
  ...HORIZONS.flatMap((h) => [`h${h}_status`, `h${h}_ret_from_price`, `h${h}_ret_from_open`, `h${h}_bench_ret_from_price`]),
  "permalink",
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Spreadsheet formula guard, same rule as the /results CSV button.
const cell = (v) => {
  let t = v === null || v === undefined ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(t) && !/^-?\d+(\.\d+)?$/.test(t)) t = `'${t}`;
  return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

export function toCsv(reads) {
  const lines = [...reads].sort((a, b) => Number(a.id) - Number(b.id)).map((r) => {
    const by = (h) => r.outcomes?.find((o) => Number(o.horizon) === h);
    const bench = r.outcomes?.find((o) => o.bench_symbol)?.bench_symbol ?? "";
    return [
      r.id, r.first_seen_at, r.symbol, r.market, r.side, r.score, r.price, r.currency, r.quote_age_sec, r.bar_date, bench,
      ...HORIZONS.flatMap((h) => { const o = by(h); return [o?.status ?? "pending", o?.ret_from_price, o?.ret_from_open, o?.bench_ret_from_price]; }),
      `https://tickfloor.com/results#read-${r.id}`,
    ].map(cell).join(",");
  });
  return [COLUMNS.join(","), ...lines].join("\n") + "\n";
}

export async function fetchAllReads({ base = "https://tickfloor.com", pauseMs = 1000, maxRequests = MAX_REQUESTS } = {}) {
  const reads = new Map();
  let cursor = null;
  let requests = 0;
  while (requests < maxRequests) {
    if (requests) await sleep(pauseMs);
    requests++;
    const url = `${base}/api/health?route=track-record&view=reads&limit=50${cursor ? `&cursor=${cursor}` : ""}`;
    const res = await fetch(url, { headers: { "user-agent": "tickfloor-reads-ledger-export/1" }, signal: AbortSignal.timeout(20000) });
    if (res.status === 429) { await sleep(5000); continue; } // a retry counts against the cap
    if (!res.ok) throw new Error(`feed answered ${res.status} for ${url}`);
    const page = await res.json();
    if (!Array.isArray(page.reads)) throw new Error(`unexpected feed shape: ${Object.keys(page).join(",")}`);
    for (const r of page.reads) reads.set(String(r.id), r);
    cursor = page.nextCursor;
    if (!cursor) return { reads: [...reads.values()], requests, complete: true };
  }
  return { reads: [...reads.values()], requests, complete: false };
}

async function selftest() {
  const all = Array.from({ length: 120 }, (_, i) => ({
    id: String(1000 - i), first_seen_at: "2026-10-01T00:00:00.000Z", symbol: i === 7 ? "=EVIL" : "AAA", market: "us", side: "BUY", score: 3, price: 10, currency: "USD",
    quote_age_sec: 4, bar_date: "2026-09-30", email: "leak@example.com", user_id: "u1",
    outcomes: [{ horizon: 5, status: "resolved", ret_from_price: "0.01", ret_from_open: "0.02", bench_symbol: "SPY", bench_ret_from_price: "0.005" }],
  }));
  const server = createServer((req, res) => {
    const cursor = Number(new URL(req.url, "http://x").searchParams.get("cursor") ?? Infinity);
    const reads = all.filter((r) => Number(r.id) < cursor).slice(0, 50);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ reads, nextCursor: reads.length === 50 ? reads.at(-1).id : null }));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const { reads, requests, complete } = await fetchAllReads({ base, pauseMs: 0 });
  const capped = await fetchAllReads({ base, pauseMs: 0, maxRequests: 2 });
  server.close();
  const csv = toCsv(reads);
  const rows = csv.trim().split("\n");
  assert.ok(complete && requests === 3 && reads.length === 120, `paging: ${requests} requests, ${reads.length} reads`);
  assert.ok(!capped.complete && capped.requests === 2, "a run that hits the cap reports incomplete");
  assert.ok(MAX_REQUESTS * 50 >= 10000, "the cap must leave room for the feed to grow"); // 40 x 50 = 2,000 stopped the export once the feed passed it
  assert.ok(rows.length === 121 && rows[0] === COLUMNS.join(","), "header + 120 rows");
  assert.ok(!/email|user/i.test(rows[0]) && !csv.includes("leak@example.com"), "no account columns or values");
  assert.ok(csv.includes(",'=EVIL,"), "formula guard");
  assert.ok(rows[1].startsWith("881,") && rows[1].includes(",resolved,0.01,0.02,0.005,"), "ascending by id, h5 fields");
  console.log("selftest ok");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv[2] === "--selftest") await selftest();
  else {
    const out = process.argv[2] ?? "data/reads-ledger.csv";
    const { reads, requests, complete } = await fetchAllReads();
    if (!complete) throw new Error(`stopped at ${MAX_REQUESTS} requests with more pages left; raise MAX_REQUESTS on purpose`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, toCsv(reads));
    const five = reads.filter((r) => r.outcomes?.some((o) => Number(o.horizon) === 5 && o.status === "resolved")).length;
    console.log(`${reads.length} reads, ${five} with a resolved 5-session outcome, ${requests} requests -> ${out}`);
  }
}
