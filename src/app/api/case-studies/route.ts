import { NextResponse } from "next/server";
import { getCaseStudies, saveCaseStudy, saveCaseStudies } from "@/lib/db";
import type { CaseStudy } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await getCaseStudies();
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (Array.isArray(body)) {
      const updated = await saveCaseStudies(body);
      return NextResponse.json(updated);
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
    return NextResponse.json(saved, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save case study" }, { status: 500 });
  }
}
