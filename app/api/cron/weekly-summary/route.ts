/**
 * /api/cron/weekly-summary — triggers the Supabase Edge Function
 * Protected by CRON_SECRET header. Full implementation in Phase 7.
 */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // TODO Phase 7: invoke Supabase Edge Function weekly-summary
  return NextResponse.json({ message: "weekly-summary stub — Phase 7" });
}
