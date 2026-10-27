import { Solari } from "@solarisdk/browser";
import type { Page } from "patchright-core";
import { nanoid } from "nanoid";
import path from "node:path";
import fs from "node:fs/promises";
import type { Audit, Finding, FlowStep } from "./types";
import { runAllChecks, checkFlowAsymmetry, scoreFindings } from "./checks";

const SCREENSHOT_DIR = path.join(process.cwd(), "public", "screenshots");

/**
 * Walks one named flow (e.g. "signup" or "cancel subscription") on the
 * target site. This is deliberately generic: it clicks the most likely
 * next-step element at each stage (primary CTA, or a link matching the
 * flow's target phrase) up to a step limit, running the full check suite
 * at every stop and screenshotting as it goes.
 *
 * A real submission should replace `guessNextStep` with flow-specific
 * selectors once you've manually walked the target site once — auto-
 * guessing is a reasonable default for a first pass, not a substitute for
 * knowing the actual site.
 */
async function guessNextStep(page: Page, intent: "signup" | "cancel") {
  const candidates =
    intent === "signup"
      ? ['button:has-text("Sign up")', 'button:has-text("Get started")', 'button:has-text("Continue")', 'button[type="submit"]']
      : [
          'a:has-text("Cancel")',
          'button:has-text("Cancel")',
          'a:has-text("Manage subscription")',
          'a:has-text("Account")',
          'a:has-text("Settings")'
        ];

  for (const selector of candidates) {
    const el = page.locator(selector).first();
    if (await el.isVisible().catch(() => false)) {
      return el;
    }
  }
  return null;
}

async function walkFlow(
  page: Page,
  auditId: string,
  intent: "signup" | "cancel",
  maxSteps: number
): Promise<{ steps: FlowStep[]; findings: Finding[] }> {
  const steps: FlowStep[] = [];
  const findings: Finding[] = [];
  let clickCount = 0;

  for (let i = 0; i < maxSteps; i++) {
    const stepFindings = await runAllChecks(page, i);
    findings.push(...stepFindings);

    const screenshotName = `${auditId}-${intent}-${i}.png`;
    const screenshotPath = path.join(SCREENSHOT_DIR, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

    steps.push({
      index: i,
      label: `${intent} step ${i + 1}`,
      url: page.url(),
      screenshotPath: `/screenshots/${screenshotName}`,
      clickCount
    });

    const next = await guessNextStep(page, intent);
    if (!next) break;

    await next.click().catch(() => {});
    clickCount += 1;
    await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
  }

  return { steps, findings };
}

export async function runAudit(auditId: string, targetUrl: string): Promise<Partial<Audit>> {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  const apiKey = process.env.SOLARI_API_KEY;
  if (!apiKey) {
    throw new Error("SOLARI_API_KEY is not set. Add it to .env.local — get one at console.getsolari.com");
  }

  const solari = new Solari({ apiKey });
  // recording is off by default — turn it on explicitly, since the replay
  // is the audit's evidence trail, not a nice-to-have.
  const browser = await solari.launch({ stealth: true, proxy: "us", captcha: true, recording: true });
  const sessionId = browser.id;

  let signup: Awaited<ReturnType<typeof walkFlow>> | undefined;
  let cancel: Awaited<ReturnType<typeof walkFlow>> | undefined;

  try {
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: "networkidle" });

    signup = await walkFlow(page, auditId, "signup", 6);
    cancel = await walkFlow(page, auditId, "cancel", 8);
  } finally {
    // releaseAndWait (rather than browser.close()'s fire-and-forget release)
    // so the replay is guaranteed to be ready when we ask for its URL next.
    await solari.sessions.releaseAndWait(sessionId).catch(() => {});
  }

  let recordingUrl: string | undefined;
  try {
    const replay = await solari.sessions.getReplayUrl(sessionId);
    recordingUrl = replay.url;
  } catch {
    recordingUrl = undefined;
  }

  const signupSteps = signup?.steps ?? [];
  const cancelSteps = cancel?.steps ?? [];
  const asymmetryFindings = checkFlowAsymmetry(signupSteps.length, cancelSteps.length);
  const allFindings = [...(signup?.findings ?? []), ...(cancel?.findings ?? []), ...asymmetryFindings];

  return {
    signupSteps,
    cancelSteps,
    findings: allFindings,
    score: scoreFindings(allFindings),
    recordingUrl
  };
}

export function newAuditId(): string {
  return nanoid(10);
}
