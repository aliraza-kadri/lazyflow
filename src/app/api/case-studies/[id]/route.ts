import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCaseStudies, saveCaseStudy, deleteCaseStudy } from "@/lib/db";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    const db = await getDb();

    try {
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json(
      {
        ...updated,
        persistedInDb: !!db,
        warning: !db
          ? "Database not connected. Changes saved to temporary RAM only. Add MONGODB_URI to Vercel settings."
          : undefined,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Update case study error:", error);
    return NextResponse.json({ error: "Failed to update case study" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteCaseStudy(id);
    if (!deleted) {
      return NextResponse.json({ error: "Case study not found" }, { status: 404 });
    }

    try {
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Delete case study error:", error);
    return NextResponse.json({ error: "Failed to delete case study" }, { status: 500 });
  }
}
