import { NextRequest, NextResponse } from "next/server";
import { getAudit } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const audit = await getAudit(params.id);
  if (!audit) {
    return NextResponse.json({ error: "Audit not found" }, { status: 404 });
  }
  return NextResponse.json({ audit });
}
