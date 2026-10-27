# Assessment run results

Run on 2026-10-28 after correcting the IPL streak query and re-running the application checks.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run test:ui` | Passed: 3 scenarios and 15 steps, including both home-loan calculations, positive pie-chart values, personal-loan bars, and the schedule start month. |
| `npm run test:api` | Playwright completed 5 tests. The normal post passed; 4 invalid-input cases surfaced as expected contract failures: JSONPlaceholder returned `201` for the 100,000-character title, control character, and missing `userId`, and `500` for malformed JSON. |
| `python sql/verify-sqlite.py` | Passed; round-trip transfers 1 and 2 found; Aarav Sharma has a 3-match 30+ streak from 2024-04-01; the fixture confirms a missed match breaks Gap Player's streak. |
| PostgreSQL 18 / pgAdmin 4 Query Tool | Passed against the A4 fixture: Scenario 1 returned reverse-transfer IDs 1 and 2 with amounts; Scenario 2 returned Aarav Sharma, `2024-04-01`, and 3 qualifying matches. |

The four API cases are marked as expected failures so the provider's behavior stays visible. Playwright exits successfully for expected failures, but this does not mean JSONPlaceholder meets the assignment's invalid-input requirements. The API HTML report is at `artifacts/api-report/index.html`, the UI report at `artifacts/ui-report.html`, and the SQL verifier writes its output to `artifacts/sql-results.json`. A4 PostgreSQL screenshot evidence is in `artifacts/a4-postgresql/`.
