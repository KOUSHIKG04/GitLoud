"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentActions } from "./content-actions";
import type {
  CopyContentHandler,
  ShareContentHandler,
  ShareMediaAttachment,
  SharePlatform,
} from "./generated-content-types";

export function GeneratedContentSkeleton() {
  return Array.from({ length: 6 }).map((_, index) => (
    <section key={index} className="border bg-card p-4 shadow-sm">
      <Skeleton className="h-4 w-36" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-4 flex gap-2">
        <Skeleton className="h-8 w-full sm:size-9" />
        <Skeleton className="h-8 w-full sm:size-9" />
        <Skeleton className="h-8 w-full sm:size-9" />
      </div>
    </section>
  ));
}

export function SocialPostCard({
  title,
  value,
  platform,
  mediaAttachments,
  onCopy,
  onShare,
}: {
  title: string;
  value: string;
  platform: SharePlatform;
  mediaAttachments: ShareMediaAttachment[];
  onCopy: CopyContentHandler;
  onShare: ShareContentHandler;
}) {
  return (
    <section className="flex h-full flex-col gap-4 border bg-card p-4 text-card-foreground shadow-sm">
      <h3 className="text-sm font-semibold">{title}</h3>

      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
        {value}
      </p>

      <div className="mt-auto">
        <ContentActions
          title={title}
          text={value}
          platform={platform}
          mediaAttachments={mediaAttachments}
          onCopy={onCopy}
          onShare={onShare}
        />
      </div>
    </section>
  );
}

export function ContentBlock({
  valueKey,
  title,
  value,
  mediaAttachments,
  onCopy,
  onShare,
}: {
  valueKey: string;
  title: string;
  value: string;
  mediaAttachments: ShareMediaAttachment[];
  onCopy: CopyContentHandler;
  onShare: ShareContentHandler;
}) {
  return (
    <AccordionItem
      value={valueKey}
      className="border border-border/50 bg-card px-4 text-card-foreground shadow-sm"
    >
      <AccordionTrigger>{title}</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
            {value}
          </p>

          <ContentActions
            title={title}
            text={value}
            mediaAttachments={mediaAttachments}
            onCopy={onCopy}
            onShare={onShare}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function ImplementationBlock({
  features,
  techUsed,
  mediaAttachments,
  onCopy,
  onShare,
}: {
  features: string[];
  techUsed: string[];
  mediaAttachments: ShareMediaAttachment[];
  onCopy: CopyContentHandler;
  onShare: ShareContentHandler;
}) {
  const techText = techUsed.join(", ");
  const featuresText = features.map((value) => `- ${value}`).join("\n");
  const text = ["Tech used", techText, "", "Features", featuresText].join("\n");

  return (
    <AccordionItem
      value="tech-used-and-features"
      className="border border-border/50 bg-card px-4 text-card-foreground shadow-sm"
    >
      <AccordionTrigger>Tech used and features</AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div className="space-y-4 text-sm leading-6 text-muted-foreground">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-card-foreground">
                Tech used
              </h4>
              <p className="break-words">{techText}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-card-foreground">
                Features
              </h4>
              <ul className="list-disc space-y-1 pl-5">
                {features.map((value, index) => (
                  <li key={index} className="break-words">
                    {value}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ContentActions
            title="Tech used and features"
            text={text}
            mediaAttachments={mediaAttachments}
            onCopy={onCopy}
            onShare={onShare}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
