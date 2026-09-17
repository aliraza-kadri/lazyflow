import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSettings, saveSettings } from "@/lib/db";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(settings, {
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await saveSettings(body);
    const db = await getDb();

    try {
      revalidatePath("/", "page");
      revalidatePath("/contact", "page");
      revalidatePath("/", "layout");
    } catch (err) {
      console.warn("Revalidation warning:", err);
    }

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
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
