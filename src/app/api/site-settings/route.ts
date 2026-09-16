import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ whatsappNumber: settings.whatsappNumber });
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
    return NextResponse.json({ whatsappNumber: updated.whatsappNumber });
  } catch {
    return NextResponse.json({ error: "Failed to save site settings" }, { status: 500 });
  }
}
