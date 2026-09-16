import { NextResponse } from "next/server";
import { getContent, saveContent } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await getContent();
  return NextResponse.json(content);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const updated = await saveContent(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}
