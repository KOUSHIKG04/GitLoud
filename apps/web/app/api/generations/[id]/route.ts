import { db } from "@repo/db/client";
import { generatedContentSchema } from "@repo/shared/generated-content";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = generatedContentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid generated content" },
      { status: 400 },
    );
  }

  const updated = await db.generatedContent.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ generatedContent: updated });
}
