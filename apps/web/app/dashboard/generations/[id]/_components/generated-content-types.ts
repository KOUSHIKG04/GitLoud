import type { GenerationMediaAttachment } from "@repo/shared/generations";

export type ShareMediaAttachment = GenerationMediaAttachment;

export type SharePlatform = "twitter" | "linkedIn" | "reddit" | "discord";

export type ShareContentHandler = (
  title: string,
  value: string,
  attachments?: ShareMediaAttachment[],
) => Promise<void>;

export type CopyContentHandler = (value: string) => Promise<boolean>;
