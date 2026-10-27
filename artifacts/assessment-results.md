# Assessment run results

Run on 2026-10-28 in the project workspace after correcting the IPL streak query.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `python sql/verify-sqlite.py` | Passed; round-trip transfers 1 and 2 found; Aarav Sharma has a 3-match 30+ streak from 2024-04-01; the fixture confirms a missed match breaks Gap Player's streak |
| `npm run test:ui` | Could not reach the app: Chromium reported `ERR_NETWORK_ACCESS_DENIED` for `http://127.0.0.1:3000/`. All three scenarios stopped at initial navigation, before app assertions. |
| `npm run test:api` | Could not reach JSONPlaceholder: DNS lookup returned `ENOTFOUND jsonplaceholder.typicode.com` for all five requests. The missing-field assertion has not been re-evaluated against a live response in this run. |

The UI and API HTML reports contain the current run diagnostics. The SQL verifier writes reproducible output to `artifacts/sql-results.json`. Re-run the UI suite with the app available at `APP_BASE_URL` and the API suite with network access to verify those integrations. JSONPlaceholder is a permissive mock and may return `201` for invalid input, which would be reported as an expected contract failure by the missing-field test.

