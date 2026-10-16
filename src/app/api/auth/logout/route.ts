import { NextResponse } from "next/server";
import { clearOwnerSession } from "@/lib/session";

export async function POST() {
  await clearOwnerSession();
  return NextResponse.json({ ok: true });
}
