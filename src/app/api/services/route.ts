import { NextResponse } from "next/server";
import { getServices, saveService, saveServices } from "@/lib/db";
import type { Service } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await getServices();
  return NextResponse.json(services);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      const updated = await saveServices(body);
      return NextResponse.json(updated);
    }
    const newService: Service = {
      id: body.id || `sv_${Date.now()}`,
      title: body.title || "",
      description: body.description || "",
      category: body.category || "",
      active: body.active !== undefined ? body.active : true,
    };
    const saved = await saveService(newService);
    return NextResponse.json(saved, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save service" }, { status: 500 });
  }
}
