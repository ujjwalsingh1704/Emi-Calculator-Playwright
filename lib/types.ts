export type Severity = "low" | "medium" | "high";

export type FindingKind =
  | "false_urgency"
  | "preselected_addon"
  | "visual_imbalance"
  | "confirmshame_copy"
  | "buried_cancel_link"
  | "flow_asymmetry"
  | "forced_contact_channel";

export interface Finding {
  id: string;
  kind: FindingKind;
  severity: Severity;
  title: string;
  detail: string;
  stepIndex: number;
  screenshotPath?: string;
}

export interface FlowStep {
  index: number;
  label: string;
  url: string;
  screenshotPath: string;
  clickCount: number;
}

export type AuditStatus = "queued" | "running" | "complete" | "failed";

export interface Audit {
  id: string;
  targetUrl: string;
  status: AuditStatus;
  createdAt: string;
  completedAt?: string;
  error?: string;
  signupSteps: FlowStep[];
  cancelSteps: FlowStep[];
  findings: Finding[];
  score: number; // 0 (clean) to 100 (worst)
  recordingUrl?: string;
}
