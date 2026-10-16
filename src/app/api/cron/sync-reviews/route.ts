import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { runReviewWorkflow } from "@/lib/workflow";

export const runtime = "nodejs";
export const maxDuration = 60;

function authorized(request: Request) {
  const header = request.headers.get("authorization");
  const url = new URL(request.url);
  const token = header?.replace("Bearer ", "") || url.searchParams.get("secret");
  return token === env.cronSecret;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businessId = new URL(request.url).searchParams.get("businessId") ?? undefined;
  const results = await runReviewWorkflow(businessId);
  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), results });
}

export async function POST(request: Request) {
  return GET(request);
}
