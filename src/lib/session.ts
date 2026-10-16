import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE = "rl_owner";

export async function setOwnerSession(email: string) {
  const store = await cookies();
  store.set(COOKIE, email.toLowerCase(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearOwnerSession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getOwnerEmail(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE)?.value ?? null;
}

export async function getSessionBusinesses() {
  const email = await getOwnerEmail();
  if (!email) return { email: null, businesses: [] as Awaited<ReturnType<typeof prisma.business.findMany>> };

  const businesses = await prisma.business.findMany({
    where: { ownerEmail: email },
    include: { subscription: true },
    orderBy: { name: "asc" },
  });

  return { email, businesses };
}
