// Solari's browser runs on a stealth-patched Playwright fork, so Page
// objects returned by `browser.newPage()` are typed against that fork
// rather than stock playwright-core. Same API surface, different package.
import type { Page } from "patchright-core";
import type { Finding, FindingKind, Severity } from "./types";
import { nanoid } from "nanoid";

/**
 * Each check runs against a live Playwright Page (driven through Solari's
 * stealth browser) at a given step in a flow, and returns zero or more
 * findings. Checks are intentionally cheap and DOM-local — the expensive
 * part of this tool is walking the real flow, not the detection itself.
 */

const CONFIRM_SHAME_PATTERNS = [
  /no,?\s+i\s+don'?t\s+want/i,
  /no,?\s+i'?d\s+rather\s+pay\s+full\s+price/i,
  /i\s+don'?t\s+want\s+to\s+save/i,
  /no\s+thanks,?\s+i\s+like/i,
  /i\s+prefer\s+to\s+miss\s+out/i
];

const URGENCY_PATTERNS = [
  /only\s+\d+\s+left/i,
  /\d+\s+people\s+(are\s+)?(viewing|looking)/i,
  /offer\s+ends\s+in/i,
  /price\s+increases\s+in/i,
  /last\s+chance/i
];

function mkFinding(
  kind: FindingKind,
  severity: Severity,
  title: string,
  detail: string,
  stepIndex: number
): Finding {
  return { id: nanoid(8), kind, severity, title, detail, stepIndex };
}

export async function checkConfirmShaming(page: Page, stepIndex: number): Promise<Finding[]> {
  const findings: Finding[] = [];
  const texts = await page.locator("button, a").allTextContents();
  for (const text of texts) {
    const trimmed = text.trim();
    if (!trimmed) continue;
    if (CONFIRM_SHAME_PATTERNS.some((re) => re.test(trimmed))) {
      findings.push(
        mkFinding(
          "confirmshame_copy",
          "medium",
          "Confirm-shaming decline option",
          `A decline button/link reads "${trimmed}" — phrased to shame the user for opting out instead of stating the action neutrally.`,
          stepIndex
        )
      );
    }
  }
  return findings;
}

export async function checkFalseUrgency(page: Page, stepIndex: number): Promise<Finding[]> {
  const findings: Finding[] = [];
  const bodyText = await page.locator("body").innerText();
  for (const re of URGENCY_PATTERNS) {
    const match = bodyText.match(re);
    if (match) {
      findings.push(
        mkFinding(
          "false_urgency",
          "low",
          "Urgency or scarcity messaging",
          `Found the phrase "${match[0]}" — worth verifying on a second page load whether the number/timer actually changes, which would confirm it's fabricated.`,
          stepIndex
        )
      );
    }
  }
  return findings;
}

export async function checkPreselectedAddons(page: Page, stepIndex: number): Promise<Finding[]> {
  const findings: Finding[] = [];
  const checkboxes = page.locator('input[type="checkbox"]');
  const count = await checkboxes.count();
  for (let i = 0; i < count; i++) {
    const box = checkboxes.nth(i);
    const checked = await box.isChecked().catch(() => false);
    if (!checked) continue;
    // Try to find an associated label to describe what got opted in silently.
    const id = await box.getAttribute("id");
    let label = "an add-on";
    if (id) {
      const labelText = await page
        .locator(`label[for="${id}"]`)
        .innerText()
        .catch(() => "");
      if (labelText) label = labelText.trim();
    }
    findings.push(
      mkFinding(
        "preselected_addon",
        "medium",
        "Pre-checked opt-in",
        `A checkbox for "${label}" is checked by default — the user must notice and uncheck it to avoid opting in.`,
        stepIndex
      )
    );
  }
  return findings;
}

export async function checkVisualImbalance(page: Page, stepIndex: number): Promise<Finding[]> {
  const findings: Finding[] = [];
  // Compare the rendered size of the primary CTA vs. any decline/secondary link
  // near it, as a proxy for "the yes button is huge, the no link is tiny."
  const primary = page.locator('button[type="submit"], button:has-text("Yes"), button:has-text("Continue"), button:has-text("Upgrade")').first();
  const secondary = page.locator('a:has-text("No"), a:has-text("Skip"), a:has-text("Cancel"), a:has-text("No thanks")').first();

  const primaryBox = await primary.boundingBox().catch(() => null);
  const secondaryBox = await secondary.boundingBox().catch(() => null);

  if (primaryBox && secondaryBox) {
    const primaryArea = primaryBox.width * primaryBox.height;
    const secondaryArea = secondaryBox.width * secondaryBox.height;
    if (secondaryArea > 0 && primaryArea / secondaryArea > 4) {
      findings.push(
        mkFinding(
          "visual_imbalance",
          "low",
          "Disproportionate call-to-action sizing",
          `The primary action button renders roughly ${Math.round(primaryArea / secondaryArea)}x the area of the nearby decline link, steering attention toward one choice.`,
          stepIndex
        )
      );
    }
  }
  return findings;
}

export async function checkForcedContactChannel(page: Page, stepIndex: number): Promise<Finding[]> {
  const findings: Finding[] = [];
  const bodyText = await page.locator("body").innerText();
  const requiresCall = /call\s+us\s+to\s+cancel|must\s+call|cancel\s+by\s+phone/i.test(bodyText);
  const requiresChat = /chat\s+with\s+support\s+to\s+cancel|contact\s+support\s+to\s+cancel/i.test(bodyText);
  if (requiresCall || requiresChat) {
    findings.push(
      mkFinding(
        "forced_contact_channel",
        "high",
        "Cancellation requires a phone call or chat",
        `The page indicates cancellation cannot be completed through the same self-serve interface used for signup — it requires ${
          requiresCall ? "a phone call" : "a support chat"
        } instead.`,
        stepIndex
      )
    );
  }
  return findings;
}

/** Runs the full check suite against the current page state for one step. */
export async function runAllChecks(page: Page, stepIndex: number): Promise<Finding[]> {
  const results = await Promise.all([
    checkConfirmShaming(page, stepIndex),
    checkFalseUrgency(page, stepIndex),
    checkPreselectedAddons(page, stepIndex),
    checkVisualImbalance(page, stepIndex),
    checkForcedContactChannel(page, stepIndex)
  ]);
  return results.flat();
}

/** Compares signup-flow step count against cancel-flow step count. */
export function checkFlowAsymmetry(signupSteps: number, cancelSteps: number): Finding[] {
  if (cancelSteps > signupSteps * 2 && cancelSteps - signupSteps >= 2) {
    return [
      mkFinding(
        "flow_asymmetry",
        "high",
        "Cancellation is much harder than signup",
        `Signing up took ${signupSteps} step(s); cancelling took ${cancelSteps} step(s) — a ${(
          cancelSteps / Math.max(signupSteps, 1)
        ).toFixed(1)}x asymmetry between joining and leaving.`,
        cancelSteps
      )
    ];
  }
  return [];
}

/** Rolls findings up into a single 0–100 severity score for the report header. */
export function scoreFindings(findings: Finding[]): number {
  const weights: Record<Severity, number> = { low: 6, medium: 14, high: 24 };
  const raw = findings.reduce((sum, f) => sum + weights[f.severity], 0);
  return Math.max(0, Math.min(100, raw));
}
