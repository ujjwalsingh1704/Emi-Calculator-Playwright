"use client";

import { useEffect, useState } from "react";
import type { Audit, Finding, Severity } from "@/lib/types";

const SEVERITY_LABEL: Record<Severity, string> = {
  high: "High",
  medium: "Medium",
  low: "Low"
};

function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 40 ? "flag" : score >= 15 ? "medium" : "clear";
  const bg = tone === "flag" ? "bg-flagfaint text-flag" : tone === "clear" ? "bg-clearfaint text-clear" : "bg-panel text-ink";
  return (
    <span className={`inline-block border border-current px-3 py-1 text-sm ${bg}`}>
      {score} / 100
    </span>
  );
}

function FindingRow({ finding, index }: { finding: Finding; index: number }) {
  return (
    <li className="border-b border-rule py-6">
      <div className="mb-2 flex items-baseline gap-3">
        <span className="font-serif text-xl text-inkfaint">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="font-serif text-lg font-semibold">{finding.title}</h3>
        <span
          className={`ml-auto shrink-0 border px-2 py-0.5 text-xs ${
            finding.severity === "high"
              ? "border-flag text-flag"
              : finding.severity === "medium"
              ? "border-ink text-ink"
              : "border-inkfaint text-inkfaint"
          }`}
        >
          {SEVERITY_LABEL[finding.severity]}
        </span>
      </div>
      <p className="pl-9 text-sm text-inkfaint">{finding.detail}</p>
    </li>
  );
}

export default function AuditReportPage({ params }: { params: { id: string } }) {
  const [audit, setAudit] = useState<Audit | null>(null);

  useEffect(() => {
    let active = true;
    async function poll() {
      const res = await fetch(`/api/audits/${params.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (!active) return;
      setAudit(data.audit);
      if (data.audit.status === "queued" || data.audit.status === "running") {
        setTimeout(poll, 2500);
      }
    }
    poll();
    return () => {
      active = false;
    };
  }, [params.id]);

  if (!audit) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <p className="text-inkfaint">Loading…</p>
      </main>
    );
  }

  if (audit.status === "queued" || audit.status === "running") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <p className="mb-2 font-serif text-2xl">Auditing {audit.targetUrl}</p>
        <p className="text-inkfaint">
          Walking the signup and cancellation flows through a live stealth
          browser session — this takes a minute or two. This page updates on
          its own.
        </p>
      </main>
    );
  }

  if (audit.status === "failed") {
    return (
      <main className="mx-auto max-w-2xl px-6 py-20">
        <p className="mb-2 font-serif text-2xl text-flag">Audit failed</p>
        <p className="text-inkfaint">{audit.error}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <div className="mb-12 border-b border-rule pb-8">
        <p className="mb-2 text-sm text-inkfaint">Audit report</p>
        <h1 className="mb-4 font-serif text-3xl font-semibold">{audit.targetUrl}</h1>
        <div className="flex items-center gap-4">
          <ScoreBadge score={audit.score} />
          <span className="text-sm text-inkfaint">
            {audit.findings.length} pattern{audit.findings.length === 1 ? "" : "s"} found ·{" "}
            {audit.signupSteps.length} step signup · {audit.cancelSteps.length} step cancellation
          </span>
        </div>
        {audit.recordingUrl && (
          <a
            href={audit.recordingUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-sm underline underline-offset-4"
          >
            Watch the full session recording →
          </a>
        )}
      </div>

      {audit.findings.length === 0 ? (
        <p className="text-inkfaint">No flagged patterns — this flow came back clean.</p>
      ) : (
        <ul>
          {audit.findings
            .slice()
            .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]))
            .map((f, i) => (
              <FindingRow key={f.id} finding={f} index={i} />
            ))}
        </ul>
      )}

      <div className="mt-12 grid grid-cols-2 gap-6">
        <div>
          <p className="mb-3 text-sm text-inkfaint">Signup flow</p>
          <div className="grid grid-cols-3 gap-2">
            {audit.signupSteps.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s.index} src={s.screenshotPath} alt={s.label} className="border border-rule" />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm text-inkfaint">Cancellation flow</p>
          <div className="grid grid-cols-3 gap-2">
            {audit.cancelSteps.map((s) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={s.index} src={s.screenshotPath} alt={s.label} className="border border-rule" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
