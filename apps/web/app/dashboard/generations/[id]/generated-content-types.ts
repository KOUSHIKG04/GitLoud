export type ShareMediaAttachment = {
  id: string;
  secureUrl: string;
  resourceType: string;
  fileName: string;
  mimeType: string;
  bytes: number;
  width: number | null;
  height: number | null;
  duration: number | null;
};

export type SharePlatform = "twitter" | "linkedIn" | "reddit" | "discord";

export type ShareContentHandler = (
  title: string,
  value: string,
  attachments?: ShareMediaAttachment[],
) => Promise<void>;

export type CopyContentHandler = (value: string) => Promise<boolean>;
