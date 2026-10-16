import { NextResponse } from "next/server";
import { getSessionBusinesses } from "@/lib/session";

export async function GET() {
  const { email, businesses } = await getSessionBusinesses();
  if (!email) {
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }
  return NextResponse.json({ email, businesses });
}
