import { getCurrentUserId } from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(): Promise<Response> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
