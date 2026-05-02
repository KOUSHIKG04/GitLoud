import type { ShareMediaAttachment } from "./generated-content-types";

export function createShareUrls({ title, text }: { title: string; text: string }) {
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(text);

  return {
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
    linkedIn: `https://www.linkedin.com/feed/?shareActive=true&text=${encodedText}`,
    reddit: `https://www.reddit.com/submit?title=${encodedTitle}&text=${encodedText}`,
    discord: "https://discord.com/app",
  };
}

export function withMediaLinks(
  text: string,
  attachments: ShareMediaAttachment[],
) {
  if (attachments.length === 0) {
    return text;
  }

  const mediaLinks = attachments
    .map((attachment) => attachment.secureUrl)
    .join("\n");

  return `${text}\n\nMedia:\n${mediaLinks}`;
}

export async function getShareableFiles(attachments: ShareMediaAttachment[]) {
  const files: File[] = [];

  for (const attachment of attachments) {
    try {
      const response = await fetch(attachment.secureUrl);

      if (!response.ok) {
        continue;
      }

      const blob = await response.blob();
      files.push(
        new File([blob], attachment.fileName, {
          type: attachment.mimeType || blob.type,
        }),
      );
    } catch {
      continue;
    }
  }

  return files;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
