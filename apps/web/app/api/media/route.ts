import { createHash } from "node:crypto";
import { db } from "@repo/db/client";
import { getCurrentUserId } from "@/lib/session";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

const maxUploadBytes = 25 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

type CloudinaryUploadResponse = {
  public_id: string;
  resource_type: string;
  secure_url: string;
  url: string;
  bytes: number;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
};

export async function POST(request: Request): Promise<Response> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Media uploads are not configured" },
      { status: 503 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a media file" }, { status: 400 });
  }

  if (!allowedMimeTypes.has(file.type)) {
    return NextResponse.json(
      { error: "Upload an image or video file" },
      { status: 400 },
    );
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json(
      { error: "Media file must be 25MB or smaller" },
      { status: 400 },
    );
  }

  const resourceType = file.type.startsWith("video/") ? "video" : "image";
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const folder = `gitloud/${userId}`;
  const signature = createCloudinarySignature(
    { folder, timestamp },
    apiSecret,
  );

  const uploadFormData = new FormData();
  uploadFormData.set("file", file);
  uploadFormData.set("api_key", apiKey);
  uploadFormData.set("timestamp", timestamp);
  uploadFormData.set("folder", folder);
  uploadFormData.set("signature", signature);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: uploadFormData,
      },
    );

    const upload = (await response.json()) as
      | Partial<CloudinaryUploadResponse>
      | { error?: { message?: string } };

    if (!response.ok || !isCloudinaryUploadResponse(upload)) {
      const message =
        "error" in upload && upload.error?.message
          ? upload.error.message
          : "Cloudinary upload failed";
      throw new Error(message);
    }

    const mediaAttachment = await db.mediaAttachment.create({
      data: {
        userId,
        url: upload.url,
        secureUrl: upload.secure_url,
        publicId: upload.public_id,
        resourceType: upload.resource_type,
        format: upload.format,
        fileName: file.name,
        mimeType: file.type,
        bytes: upload.bytes,
        width: upload.width,
        height: upload.height,
        duration: upload.duration,
      },
      select: {
        id: true,
        secureUrl: true,
        resourceType: true,
        fileName: true,
        mimeType: true,
        bytes: true,
      },
    });

    return NextResponse.json({ mediaAttachment });
  } catch (error) {
    const message = getUploadErrorMessage(error);

    logger.error("Media upload failed", {
      error: message,
      fileName: file.name,
      mimeType: file.type,
    });

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}

function createCloudinarySignature(
  params: Record<string, string>,
  apiSecret: string,
) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

function isCloudinaryUploadResponse(
  value: Partial<CloudinaryUploadResponse> | { error?: { message?: string } },
): value is CloudinaryUploadResponse {
  const upload = value as Partial<CloudinaryUploadResponse>;

  return (
    typeof value === "object" &&
    value !== null &&
    typeof upload.public_id === "string" &&
    typeof upload.resource_type === "string" &&
    typeof upload.secure_url === "string" &&
    typeof upload.url === "string" &&
    typeof upload.bytes === "number"
  );
}

function getUploadErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Could not upload media";
  }

  if (
    error.message.includes("MediaAttachment") ||
    error.message.includes("does not exist") ||
    error.message.includes("Unknown argument")
  ) {
    return "Media database table is not ready. Run Prisma migrate and generate, then try again.";
  }

  if (
    error.message.toLowerCase().includes("invalid signature") ||
    error.message.toLowerCase().includes("api key") ||
    error.message.toLowerCase().includes("cloud name")
  ) {
    return "Cloudinary credentials are invalid. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.";
  }

  return error.message || "Could not upload media";
}
