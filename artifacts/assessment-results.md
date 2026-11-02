# Assessment run results

Local verification completed on 2026-11-03 after strengthening the calculation checks, switching the API suite to direct JSONPlaceholder requests, and removing unrelated audit modules.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run test:unit` | Passed: 6 tests. V8 reports 100% line, branch, and function coverage for `lib/emi.js`. |
| `npm run test:api` | Valid POST passed; four provider mismatches were recorded as expected failures. Direct responses: `201` for the oversized title, NUL character, and missing `userId`; `500` for malformed JSON. |
| `npm run test:ui` | Passed: 3 scenarios and 27 steps. Verifies both home-loan calculations and every repayment summary, pie-chart percentages, schedule row count, all first-installment values, 36 chart bars, tooltip balance, and month-driven schedule date. |
| `npm run test:all` | Passed; runs unit, direct API, and Cucumber suites in sequence. |
| `npm run build` | Passed |
| `python sql/verify-sqlite.py` | Passed; round-trip transfers 1 and 2 found; Aarav Sharma has a 3-match 30+ streak from 2024-04-01; a missed match breaks Gap Player's streak. |
| PostgreSQL 18 / pgAdmin 4 Query Tool | Previously verified against the A4 fixture. Five schema/query/output screenshots are under `artifacts/a4-postgresql/`. |

The three deliberately broken locator examples remain tagged `@self-heal` and excluded from the standard UI run, as required. The review and AI prompt workflow is in `docs/locator-self-healing.md`. Playwright and Cucumber generate local HTML reports; GitHub Actions uploads them as the `assessment-test-reports` artifact. The PostgreSQL screenshots remain committed under `artifacts/a4-postgresql/`.
