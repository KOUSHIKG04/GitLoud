import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getCurrentSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function getCurrentUserId() {
  const session = await getCurrentSession();

  return session?.user.id ?? null;
}
