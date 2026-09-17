import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServices, saveService, saveServices } from "@/lib/db";
import { getDb } from "@/lib/mongodb";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const services = await getServices();
  return NextResponse.json(services, {
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await getDb();

    if (Array.isArray(body)) {
      const updated = await saveServices(body);
      try {
        revalidatePath("/services", "page");
        revalidatePath("/", "layout");
      } catch {}
      return NextResponse.json(updated, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    const newService: Service = {
      id: body.id || `sv_${Date.now()}`,
      title: body.title || "",
      description: body.description || "",
      category: body.category || "",
      active: body.active !== undefined ? body.active : true,
    };
    const saved = await saveService(newService);

    try {
      revalidatePath("/services", "page");
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json(
      {
        ...saved,
        persistedInDb: !!db,
        warning: !db
          ? "Database not connected. Changes saved to temporary RAM only. Add MONGODB_URI to Vercel settings."
          : undefined,
      },
      {
        status: 201,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch (error) {
    console.error("Save service error:", error);
    return NextResponse.json({ error: "Failed to save service" }, { status: 500 });
  }
}
