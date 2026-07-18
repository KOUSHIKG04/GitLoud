"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { ContentActions } from "./content-actions";
import type {
  CopyContentHandler,
  ShareContentHandler,
  ShareMediaAttachment,
} from "./generated-content-types";

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
      className="rounded-sm border-none bg-card px-5 text-card-foreground shadow-sm"
    >
      <AccordionTrigger className="py-4 text-[17px] font-semibold leading-7 hover:no-underline">
        {title}
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <p className="whitespace-pre-wrap wrap-break-word text-base leading-7 text-muted-foreground">
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
