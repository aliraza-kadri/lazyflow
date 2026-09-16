import { NextResponse } from "next/server";
import { saveLead, getLeads } from "@/lib/db";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

// Webhook Verification (e.g. WhatsApp Cloud API / Meta challenge)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // If Meta WhatsApp Cloud verification token or standard challenge
  if (challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({
    status: "active",
    endpoint: "/api/leads/webhook",
    description: "WhatsApp and Automation Webhook Ingestion endpoint for LazyFlow Leads",
    instructions: "Send POST request with JSON containing name, phone, message/problem, or Meta WhatsApp payload.",
  });
}

// Ingest incoming WhatsApp or Automation message into Leads
export async function POST(request: Request) {
  try {
    const body = await request.json();

    let name = body.name || "";
    let phone = body.phone || body.from || body.sender || "";
    let message = body.message || body.text || body.problem || "";
    let business = body.business || "";

    // Parse Meta WhatsApp Cloud API webhook structure if present
    if (body.entry && Array.isArray(body.entry)) {
      try {
        const entry = body.entry[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const contact = value?.contacts?.[0];
        const msg = value?.messages?.[0];

        if (contact) {
          name = contact.profile?.name || name;
          phone = contact.wa_id || phone;
        }
        if (msg) {
          message = msg.text?.body || msg.button?.text || msg.type || message;
        }
      } catch (err) {
        console.error("Error parsing Meta WhatsApp webhook", err);
      }
    }

    if (!phone && !message && !name) {
      return NextResponse.json(
        { error: "Payload missing phone or message content" },
        { status: 400 }
      );
    }

    // Clean phone number
    const cleanPhone = phone ? String(phone).replace(/[^\d+]/g, "") : "";

    // Check if a lead with this phone already exists to update it or append
    const existingLeads = await getLeads();
    const existing = cleanPhone
      ? existingLeads.find((l) => l.phone && l.phone.replace(/[^\d]/g, "").endsWith(cleanPhone.slice(-10)))
      : null;

    if (existing) {
      existing.notes = existing.notes
        ? `${existing.notes}\n[${new Date().toLocaleTimeString()} Incoming]: ${message}`
        : `[${new Date().toLocaleTimeString()} Incoming]: ${message}`;
      if (!existing.problem && message) {
        existing.problem = message;
      }
      if (name && (!existing.name || existing.name === "WhatsApp Visitor")) {
        existing.name = name;
      }
      await saveLead(existing);
      return NextResponse.json({ success: true, lead: existing, action: "updated" });
    }

    const newLead: Lead = {
      id: `ld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name || "WhatsApp Visitor",
      business: business || "",
      phone: cleanPhone || "Not provided",
      email: body.email || "",
      industry: body.industry || "",
      problem: message || "WhatsApp message received",
      process: body.process || "",
      status: "New",
      notes: `Captured via WhatsApp Webhook on ${new Date().toLocaleString("en-IN")}`,
      source: "WhatsApp Incoming",
      createdAt: new Date().toISOString(),
    };

    const saved = await saveLead(newLead);
    return NextResponse.json({ success: true, lead: saved, action: "created" }, { status: 201 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
