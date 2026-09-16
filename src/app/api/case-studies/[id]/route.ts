import { NextResponse } from "next/server";
import { getCaseStudies, saveCaseStudy, deleteCaseStudy } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = await getCaseStudies();
    const existing = list.find((c) => c.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }
    const body = await request.json();
    const updated = { ...existing, ...body, id };
    await saveCaseStudy(updated);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update case study" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteCaseStudy(id);
  if (!deleted) {
    return NextResponse.json({ error: "Case study not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
