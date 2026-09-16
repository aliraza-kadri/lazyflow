import { NextResponse } from "next/server";
import { getLeads, saveLead, clearAllLeads, loadSampleLeads } from "@/lib/db";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await getLeads();
  return NextResponse.json(leads);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check special action requests
    if (body.action === "load_sample") {
      const sampleLeads = await loadSampleLeads();
      return NextResponse.json({ success: true, leads: sampleLeads });
    }

    if (body.action === "clear_all") {
      await clearAllLeads();
      return NextResponse.json({ success: true, leads: [] });
    }

    const newLead: Lead = {
      id: body.id || `ld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: body.name?.trim() || "WhatsApp Enquiry",
      business: body.business?.trim() || "",
      phone: body.phone?.trim() || body.whatsapp?.trim() || "",
      email: body.email?.trim() || "",
      industry: body.industry?.trim() || "",
      problem: body.problem?.trim() || "",
      process: body.process?.trim() || "",
      status: body.status || "New",
      notes: body.notes?.trim() || "",
      source: body.source?.trim() || "Website",
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = await saveLead(newLead);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    console.error("Save lead error:", error);
    return NextResponse.json({ error: "Failed to save lead", details: String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await clearAllLeads();
    return NextResponse.json({ success: true, message: "All leads cleared" });
  } catch {
    return NextResponse.json({ error: "Failed to clear leads" }, { status: 500 });
  }
}
