import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSettings, saveSettings } from "@/lib/db";
import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json(
    { whatsappNumber: settings.whatsappNumber },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const whatsappNumber = (body.whatsappNumber || "").replace(/\D/g, "");
    if (whatsappNumber && !/^\d{8,15}$/.test(whatsappNumber)) {
      return NextResponse.json(
        { error: "Enter a valid WhatsApp number in international format." },
        { status: 400 }
      );
    }
    const updated = await saveSettings({ whatsappNumber });
    const db = await getDb();

    try {
      revalidatePath("/", "layout");
    } catch {}

    return NextResponse.json(
      {
        whatsappNumber: updated.whatsappNumber,
        persistedInDb: !!db,
      },
      {
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch {
    return NextResponse.json({ error: "Failed to save site settings" }, { status: 500 });
  }
}
