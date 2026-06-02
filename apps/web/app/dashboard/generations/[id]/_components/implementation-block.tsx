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
      className="border-none bg-card px-5 text-card-foreground shadow-sm"
    >
      <AccordionTrigger className="py-4 text-[17px] font-semibold leading-7 hover:no-underline">
        Tech used and features
      </AccordionTrigger>
      <AccordionContent>
        <div className="space-y-4">
          <div className="space-y-4 text-base leading-7 text-muted-foreground">
            <div className="space-y-1">
              <h4 className="text-base font-medium text-card-foreground">
                Tech used
              </h4>
              <p className="wrap-break-word">{techText}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-medium text-card-foreground">
                Features
              </h4>
              <ul className="list-disc space-y-1 pl-5">
                {features.map((value, index) => (
                  <li key={`${value}-${index}`} className="wrap-break-word">
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
