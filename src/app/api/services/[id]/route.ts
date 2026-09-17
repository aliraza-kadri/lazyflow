import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServices, saveService, deleteService } from "@/lib/db";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const services = await getServices();
    const existing = services.find((s) => s.id === id);
    if (!existing) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    const body = await request.json();
    const updated = { ...existing, ...body, id };
    await saveService(updated);
    const db = await getDb();

    try {
      revalidatePath("/services", "page");
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
    console.error("Update service error:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteService(id);
    if (!deleted) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    try {
      revalidatePath("/services", "page");
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json(
      { success: true },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
