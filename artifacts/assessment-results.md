# Assessment run results

Local verification completed on 2026-11-01 after implementing the Section A API validation route and strengthening the UI assertions.

| Check | Result |
| --- | --- |
| `npm run typecheck` | Passed |
| `npm run build` | Passed |
| `npm run test:api` | Passed: 5/5 tests. Valid posts are forwarded to JSONPlaceholder; an oversized title, control character, missing `userId`, and malformed JSON are rejected with client errors and messages. |
| `npm run test:ui` | Passed: 3 scenarios and 20 steps. Covers dashboard loading, both home-loan EMI calculations, positive pie-chart values, exactly 36 displayed personal-loan bars, the independently calculated first-bar balance tooltip, and the schedule date changing with the selected start month. |
| `python sql/verify-sqlite.py` | Passed; round-trip transfers 1 and 2 found; Aarav Sharma has a 3-match 30+ streak from 2024-04-01; a missed match breaks Gap Player's streak. |
| PostgreSQL 18 / pgAdmin 4 Query Tool | Previously verified against the A4 fixture: Scenario 1 returned reverse-transfer IDs 1 and 2 with amounts; Scenario 2 returned Aarav Sharma, `2024-04-01`, and 3 matches. The five query/schema evidence screenshots are under `artifacts/a4-postgresql/`. |

The three deliberately broken locator examples are tagged `@self-heal` and excluded from the standard UI run as required by the assessment. Their detection, AI prompt, review, and validation workflow is documented in `docs/locator-self-healing.md`. The optional failure demonstration is `npm run test:self-heal`.

Playwright writes the API report to `artifacts/api-report/`; Cucumber writes the UI report to `artifacts/ui-report.html`.
