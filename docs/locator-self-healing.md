# AI-assisted locator self-healing

The `@self-heal` scenarios in `features/locator-self-healing.feature` contain three intentionally incorrect locators. Keep those examples broken in the assessment branch and exclude them from the standard UI run. They demonstrate the failure signals an engineer should diagnose; the normal scenarios use valid semantic locators.

## Detection

For each failing scenario, capture the locator, failure message, current page URL, relevant DOM snapshot, and the target control's accessible role, name, and label. Check whether the element exists, whether the locator matches zero or multiple elements, and whether a navigation or state change happened before the assertion.

## Prompt approach

Give the AI the feature step, failing locator and error, relevant DOM excerpt, and the intended control. Ask it to propose the most specific locator based on the observed interface. Prefer an accessible role and name, then an associated label or exact text. Use a stable `data-testid` only when the control has no useful user-facing semantics. Ask the AI to explain why the locator is unique and what assertion proves it targets the intended control. Do not ask it to guess from the failure message alone.

## Review and validation before applying a repair

Inspect the live DOM and accessible name yourself. Confirm the proposed locator resolves to exactly one element and that the element is the intended control. Apply a candidate repair in a separate working copy or temporary branch so the required broken examples remain available. Run the focused scenario, then the full UI suite. Review traces, screenshots, and console output on failures. Keep the repair only when the evidence confirms that it targets the intended control and the full suite still passes.

## Example

For the obsolete `Rate of Interest` locator, inspect the current slider and confirm that it has role `slider` and accessible name `Interest Rate`. A suitable repair is `getByRole("slider", { name: "Interest Rate" })`. Verify uniqueness and set a value, then assert that the slider's value changed. This is a proposed repair workflow; the deliberately broken exercise step stays broken.
