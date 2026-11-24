import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getGenerationDetail } from "@/features/generations/lib/generations-api";
import { GenerationDetailScreen } from "@/features/generations/components/generation-detail-screen";

export const metadata: Metadata = {
  title: "Generated Content",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GenerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const generation = await getGenerationDetail(id);

  if (!generation) {
    notFound();
  }

  return <GenerationDetailScreen generation={generation} />;
}
