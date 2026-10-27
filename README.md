# ClearPlan EMI Calculator — Streamhub Section A

This project implements **Option A / Section A** of the Streamhub assessment. It includes a small responsive EMI application, a Playwright + Cucumber UI framework, JSONPlaceholder POST boundary coverage, and SQL scenarios with a reproducible sample fixture.

## Setup and run

Requirements: Node.js 20+, npm, and a browser supported by Playwright.

```bash
npm install
npx playwright install chromium
npm run dev
```

Open `http://localhost:3000`. The Home Loan tab defaults to 25 lakh, 10%, 10 years. The Personal Loan tab defaults to 10 lakh, 12%, 5 years. Inputs update the EMI, repayment summary and charts. The displayed payment uses the standard reducing-balance formula, with principal converted from lakh to rupees.

## Assessment coverage

| Requirement | Implementation |
| --- | --- |
| A1 dashboard, input-driven report, chart | `app/page.tsx`: calculator, pie breakdown, month schedule and bar chart |
| A2 framework and UI tests | `features/emi-calculator.feature`, `tests/steps`, `tests/pages`, `cucumber.cjs` |
| A3 JSONPlaceholder POST boundaries | `tests/api/posts.spec.ts`, Playwright request fixture |
| A4 SQL | `sql/schema.sql`, sample data and two scenario queries |

Run UI scenarios with `npm run test:ui` (start the app separately). Run API scenarios with `npm run test:api`. Run both using `npm run test:all`. UI tests write `artifacts/ui-report.html`; API tests write `artifacts/api-report/`.

## UI framework design

Feature files describe behavior; Cucumber step definitions coordinate actions; `EmiCalculatorPage` encapsulates accessible role, label and test-id locators. Environment-specific application URL is configured with `APP_BASE_URL` (defaults to `http://127.0.0.1:3000`). The Playwright API suite uses the public `https://jsonplaceholder.typicode.com` service.

## Locator self-healing exercise

`features/locator-self-healing.feature` contains three intentionally broken locator cases, tagged `@self-heal`; the standard run excludes this tag so regular assessment results stay meaningful. To demonstrate the broken cases, run `npm run test:self-heal` (they should fail).

AI-assisted repair workflow: (1) capture the failing locator, DOM snapshot, accessible name/role, and error; (2) prompt an AI to propose the most specific semantic locator, preferring role/label/text and using a stable `data-testid` only where no user-facing semantics exist; (3) inspect the DOM and confirm the target is unique and represents the intended control; (4) apply the repair in the page object; (5) run the focused scenario, then the full suite, and inspect trace/screenshot on failure. Never auto-apply a suggestion based only on fuzzy text similarity. The three broken examples intentionally remain unfixed as requested by the exercise.

## API test notes

JSONPlaceholder is a mock, not a schema-validating production service. The suite checks an excessively long title, a control character, a missing `userId`, and malformed JSON against the assignment's error-handling requirements. A successful response to invalid input is marked as an expected contract mismatch; a network error or server error remains a real failure. Earlier live runs showed JSONPlaceholder returning synthetic `201` responses for invalid objects. A production API with validation enabled is needed for a fully passing invalid-input contract check.

## SQL

See [sql/README.md](sql/README.md) for the schema, sample data, PostgreSQL query execution order, assumptions and sample results. Run `python sql/verify-sqlite.py` to execute the fixture locally. The IPL query now builds a full player-by-match grid from the 2024 match IDs in the dataset, so a missing player row or a score below 30 breaks a streak. A complete schedule and player-match records are needed for authoritative full-season results.

## AI pairing reflection

AI was used as a pair programmer to map the assessment into a working application and automation structure, scaffold the feature/page-object/step layers, and review boundary cases. It was useful for getting the first pass into a coherent structure and surfacing that JSONPlaceholder is permissive. The generated code still needs human review: locator uniqueness, mock-service behavior, SQL dialect and the precise meaning of a player "streak" are assumptions that must be checked against the actual environment/data. AI suggestions should not be applied blindly; each repaired locator needs DOM inspection and a focused plus full-suite validation.

## Test execution results

Latest local run: see `artifacts/assessment-results.md` for current run status. The API suite requires internet access; the UI suite requires Chromium and a running local server. Playwright HTML reports are generated locally by the test commands.

