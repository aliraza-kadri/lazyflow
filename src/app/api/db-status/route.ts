import { NextResponse } from "next/server";
import { getDb, getCleanMongoUri } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const hasUri = !!getCleanMongoUri();

  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({
        status: "ERROR",
        connected: false,
        hasMongoUriEnv: hasUri,
        message: hasUri
          ? "MONGODB_URI is provided, but could not connect to cluster. Check Network Access (IP whitelist) in MongoDB Atlas."
          : "MONGODB_URI is MISSING in Vercel Environment Variables! Please add MONGODB_URI in Vercel Project Settings.",
      }, { status: 500 });
    }

    const leadsCount = await db.collection("leads").countDocuments();

    return NextResponse.json({
      status: "SUCCESS",
      connected: true,
      database: "lazyflow",
      leadsInDb: leadsCount,
      message: "Successfully connected to MongoDB Atlas!",
    });
  } catch (error) {
    return NextResponse.json({
      status: "ERROR",
      connected: false,
      error: String(error),
    }, { status: 500 });
  }
}
