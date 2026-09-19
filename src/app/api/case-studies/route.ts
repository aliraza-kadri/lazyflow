import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCaseStudies, saveCaseStudy, saveCaseStudies } from "@/lib/db";
import { getDb } from "@/lib/mongodb";
import { isAuthorizedAdmin } from "@/lib/auth-guard";
import type { CaseStudy } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const list = await getCaseStudies();
  return NextResponse.json(list, {
    headers: {
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

export async function POST(request: Request) {
  const isAdmin = await isAuthorizedAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const db = await getDb();

    if (Array.isArray(body)) {
      const updated = await saveCaseStudies(body);
      try {
        revalidatePath("/", "layout");
      } catch {}
      return NextResponse.json(updated, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    const newCaseStudy: CaseStudy = {
      id: body.id || `cs_${Date.now()}`,
      title: body.title || "",
      industry: body.industry || "",
      summary: body.summary || "",
      problem: body.problem || "",
      solution: body.solution || "",
      result: body.result || "",
      published: body.published !== undefined ? body.published : true,
      isDemo: body.isDemo !== undefined ? body.isDemo : false,
      createdAt: body.createdAt || new Date().toISOString(),
    };
    const saved = await saveCaseStudy(newCaseStudy);

    try {
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
    console.error("Save case study error:", error);
    return NextResponse.json({ error: "Failed to save case study" }, { status: 500 });
  }
}
