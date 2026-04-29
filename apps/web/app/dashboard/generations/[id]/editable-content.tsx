"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { GeneratedContent } from "@repo/shared/generated-content";

type EditableGeneratedContentProps = {
  generationId: string;
  initialContent: GeneratedContent;
};

export function EditableGeneratedContent({
  generationId,
  initialContent,
}: EditableGeneratedContentProps) {
  const [content, setContent] = useState<GeneratedContent>(initialContent);
  const [draft, setDraft] = useState<GeneratedContent>(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function updateTextField(
    field: keyof Omit<GeneratedContent, "features" | "techUsed">,
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateListField(field: "features" | "techUsed", value: string) {
    setDraft((current) => ({
      ...current,
      [field]: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  }

  async function copyText(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error("Could not copy text");
    }
  }

  async function saveChanges() {
    setIsSaving(true);

    try {
      await axios.patch(`/api/generations/${generationId}`, draft);

      setContent(draft);
      setIsEditing(false);
      toast.success("Saved");
    } catch (error) {
      toast.error("Could not save changes");
    } finally {
      setIsSaving(false);
    }
  }

  function cancelEditing() {
    setDraft(content);
    setIsEditing(false);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold tracking-tight">
          Generated Content
        </h2>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button type="button" onClick={saveChanges} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <EditableTextBlock
          title="Short summary"
          value={draft.shortSummary}
          savedValue={content.shortSummary}
          isEditing={isEditing}
          onChange={(value) => updateTextField("shortSummary", value)}
          onCopy={copyText}
        />

        <EditableTextBlock
          title="Technical summary"
          value={draft.technicalSummary}
          savedValue={content.technicalSummary}
          isEditing={isEditing}
          onChange={(value) => updateTextField("technicalSummary", value)}
          onCopy={copyText}
        />

        <EditableListBlock
          title="Features"
          values={draft.features}
          savedValues={content.features}
          isEditing={isEditing}
          onChange={(value) => updateListField("features", value)}
          onCopy={copyText}
        />

        <EditableListBlock
          title="Technologies used"
          values={draft.techUsed}
          savedValues={content.techUsed}
          isEditing={isEditing}
          onChange={(value) => updateListField("techUsed", value)}
          onCopy={copyText}
        />

        <EditableTextBlock
          title="X/Twitter post"
          value={draft.tweet}
          savedValue={content.tweet}
          isEditing={isEditing}
          onChange={(value) => updateTextField("tweet", value)}
          onCopy={copyText}
        />

        <EditableTextBlock
          title="LinkedIn post"
          value={draft.linkedInPost}
          savedValue={content.linkedInPost}
          isEditing={isEditing}
          onChange={(value) => updateTextField("linkedInPost", value)}
          onCopy={copyText}
        />

        <EditableTextBlock
          title="Reddit post"
          value={draft.redditPost}
          savedValue={content.redditPost}
          isEditing={isEditing}
          onChange={(value) => updateTextField("redditPost", value)}
          onCopy={copyText}
        />

        <EditableTextBlock
          title="Portfolio bullet"
          value={draft.portfolioBullet}
          savedValue={content.portfolioBullet}
          isEditing={isEditing}
          onChange={(value) => updateTextField("portfolioBullet", value)}
          onCopy={copyText}
        />

        <EditableTextBlock
          title="Changelog entry"
          value={draft.changelogEntry}
          savedValue={content.changelogEntry}
          isEditing={isEditing}
          onChange={(value) => updateTextField("changelogEntry", value)}
          onCopy={copyText}
        />

        <EditableTextBlock
          title="Beginner-friendly explanation"
          value={draft.beginnerSummary}
          savedValue={content.beginnerSummary}
          isEditing={isEditing}
          onChange={(value) => updateTextField("beginnerSummary", value)}
          onCopy={copyText}
        />
      </div>
    </section>
  );
}

function EditableTextBlock({
  title,
  value,
  savedValue,
  isEditing,
  onChange,
  onCopy,
}: {
  title: string;
  value: string;
  savedValue: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  onCopy: (value: string) => Promise<void>;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <h3 className="text-sm font-semibold">{title}</h3>

      {isEditing ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="custom-scrollbar min-h-32 w-full resize-y rounded-md border bg-background p-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
          {savedValue}
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCopy(savedValue)}
        className="w-full sm:w-fit"
      >
        Copy
      </Button>
    </section>
  );
}

function EditableListBlock({
  title,
  values,
  savedValues,
  isEditing,
  onChange,
  onCopy,
}: {
  title: string;
  values: string[];
  savedValues: string[];
  isEditing: boolean;
  onChange: (value: string) => void;
  onCopy: (value: string) => Promise<void>;
}) {
  const savedText = savedValues.map((value) => `- ${value}`).join("\n");

  return (
    <section className="flex flex-col gap-4 rounded-xl border bg-card p-4 text-card-foreground">
      <h3 className="text-sm font-semibold">{title}</h3>

      {isEditing ? (
        <textarea
          value={values.join("\n")}
          onChange={(event) => onChange(event.target.value)}
          className="custom-scrollbar min-h-32 w-full resize-y rounded-md border bg-background p-3 text-sm leading-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted-foreground">
          {savedValues.map((value) => (
            <li key={value} className="break-words">
              {value}
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCopy(savedText)}
        className="w-full sm:w-fit"
      >
        Copy
      </Button>
    </section>
  );
}
