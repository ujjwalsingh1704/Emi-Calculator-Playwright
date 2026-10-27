import fs from "node:fs/promises";
import path from "node:path";
import type { Audit } from "./types";

const DB_PATH = path.join(process.cwd(), "data", "audits.json");

async function readAll(): Promise<Audit[]> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw) as Audit[];
  } catch {
    return [];
  }
}

async function writeAll(audits: Audit[]): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(audits, null, 2), "utf-8");
}

export async function listAudits(): Promise<Audit[]> {
  const audits = await readAll();
  return audits.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getAudit(id: string): Promise<Audit | undefined> {
  const audits = await readAll();
  return audits.find((a) => a.id === id);
}

export async function saveAudit(audit: Audit): Promise<void> {
  const audits = await readAll();
  const idx = audits.findIndex((a) => a.id === audit.id);
  if (idx >= 0) audits[idx] = audit;
  else audits.push(audit);
  await writeAll(audits);
}
