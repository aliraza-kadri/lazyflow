import { NextResponse } from "next/server";
import { getLeads, saveLead, clearAllLeads, loadSampleLeads } from "@/lib/db";
import { isAuthorizedAdmin } from "@/lib/auth-guard";
import { sendNewLeadAdminNotification, sendLeadAutoAcknowledgement } from "@/lib/email";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  const isAdmin = await isAuthorizedAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const leads = await getLeads();
  return NextResponse.json(leads, {
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check special action requests (restricted to admin)
    if (body.action === "load_sample" || body.action === "clear_all") {
      const isAdmin = await isAuthorizedAdmin(request);
      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }

      if (body.action === "load_sample") {
        const sampleLeads = await loadSampleLeads();
        return NextResponse.json({ success: true, leads: sampleLeads });
      }

      if (body.action === "clear_all") {
        await clearAllLeads();
        return NextResponse.json({ success: true, leads: [] });
      }
    }

    // Honeypot check (anti-spam bot trap)
    if (body.website_hp || body.hp_field) {
      return NextResponse.json({ success: true, message: "Inquiry received" }, { status: 201 });
    }

    const newLead: Lead = {
      id: body.id || `ld_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: body.name?.trim() || "Website Visitor",
      business: body.business?.trim() || "",
      phone: body.phone?.trim() || body.whatsapp?.trim() || "",
      email: body.email?.trim() || "",
      industry: body.industry?.trim() || "",
      problem: body.problem?.trim() || "",
      process: body.process?.trim() || "",
      status: body.status || "New",
      notes: body.notes?.trim() || "",
      source: body.source?.trim() || "Website Form",
      createdAt: body.createdAt || new Date().toISOString(),
    };

    const saved = await saveLead(newLead);

    // In Vercel Serverless, await email dispatch so the lambda doesn't terminate before socket completes
    try {
      const emailTasks: Promise<unknown>[] = [
        sendNewLeadAdminNotification(saved)
          .then((res) => console.log("Admin lead notification dispatched:", res))
          .catch((err) => console.error("Admin notification dispatch error:", err)),
      ];

      if (saved.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(saved.email)) {
        emailTasks.push(
          sendLeadAutoAcknowledgement(saved)
            .then((res) => console.log("Client confirmation email dispatched:", res))
            .catch((err) => console.error("Client confirmation error:", err))
        );
      }

      await Promise.allSettled(emailTasks);
    } catch (dispatchErr) {
      console.error("Email notification dispatch error:", dispatchErr);
    }

    return NextResponse.json(saved, {
      status: 201,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Save lead error:", error);
    return NextResponse.json({ error: "Failed to save lead", details: String(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAdmin = await isAuthorizedAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    await clearAllLeads();
    return NextResponse.json({ success: true, message: "All leads cleared" });
  } catch {
    return NextResponse.json({ error: "Failed to clear leads" }, { status: 500 });
  }
}
