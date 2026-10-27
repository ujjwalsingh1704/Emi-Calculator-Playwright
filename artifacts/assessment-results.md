# Assessment run results

Run on 2026-10-27 in the project workspace.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run build` | Passed; Next.js production build generated `/` plus existing API/report routes |
| `npm run test:api` | Passed: 5 tests, including normal, 100,000-character title, special characters, missing fields, and malformed JSON |
| `npm run test:ui` | Passed: 3 scenarios, 15 steps; two EMI calculations, pie values, personal-loan bars, and start month |
| `python sql/verify-sqlite.py` | Passed; scenario 1 returns transfer ids 1 and 2 (8% difference, 9 hours apart); scenario 2 returns Aarav Sharma from 2024-04-01 for 3 consecutive qualifying matches |

Playwright HTML reports were generated locally at `api-report/index.html` and `ui-report.html`; they are not included in the repository. The captured SQL output is `sql-results.json`. The assessment provides no authoritative full IPL dataset, so the sample is only a query fixture.
