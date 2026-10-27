# Assessment run results

Latest verification: [GitHub Actions run on main](https://github.com/ujjwalsingh1704/Emi-Calculator-Playwright/actions/runs/40578647364) (2026-10-28).

| Check | Result |
| --- | --- |
| `npm ci` | Passed |
| `npx playwright install --with-deps chromium` | Passed |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run test:api` | Passed: 5/5 tests. The valid post was proxied to JSONPlaceholder; oversized title, control character, missing `userId`, and malformed JSON were rejected with client errors and messages. |
| `npm run test:ui` | Passed: 6 scenarios and 23 steps, including the 3 repaired self-healing locator scenarios. |
| `python sql/verify-sqlite.py` | Passed; round-trip transfers 1 and 2 found; Aarav Sharma has a 3-match 30+ streak from 2024-04-01; a missed match breaks Gap Player's streak. |
| PostgreSQL 18 / pgAdmin 4 Query Tool | Passed against the A4 fixture: Scenario 1 returned reverse-transfer IDs 1 and 2 with amounts; Scenario 2 returned Aarav Sharma, `2024-04-01`, and 3 qualifying matches. |

The API validation route rejects invalid data before forwarding valid posts to JSONPlaceholder. The Playwright HTML reports from the CI run are available in the `assessment-test-reports` artifact attached to the linked GitHub Actions run. The PostgreSQL screenshots are in `artifacts/a4-postgresql/`.
