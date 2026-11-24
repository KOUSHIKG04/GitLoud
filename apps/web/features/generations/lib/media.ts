import { apiFetch } from "@/lib/api/client";
import type { UploadedMediaAttachment } from "@repo/shared/generations";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

export function getMediaValidationError(file: File) {
  if (!allowedMimeTypes.includes(file.type)) {
    return "Upload an image or video file";
  }

  if (file.size > 25 * 1024 * 1024) {
    return "Media file must be 25MB or smaller";
  }

  return null;
}

export async function uploadMedia(
  file: File,
  getToken: () => Promise<string | null>,
) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await apiFetch(
    "/media",
    {
      method: "POST",
      body: formData,
    },
    getToken,
  );

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.error ?? "Could not upload media");
  }

  return body.mediaAttachment as UploadedMediaAttachment;
}

export async function attachMediaToGeneration(
  generationId: string,
  mediaAttachmentId: string,
  getToken: () => Promise<string | null>,
) {
  const response = await apiFetch(
    `/generations/${generationId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mediaAttachmentId }),
    },
    getToken,
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Could not attach media");
  }
}
