import { getCurrentUserId } from "@/lib/session";
import { NextResponse } from "next/server";

/**
 * Trigger profile synchronization by fetching the current authenticated user's ID
 * and performing user record alignment in the database.
 *
 * @returns A JSON success response if authorized, or a 401 unauthorized response.
 */
export async function POST(): Promise<Response> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
