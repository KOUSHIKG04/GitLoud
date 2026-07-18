"use client";

import { useAuth } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-client";
import { getApiError } from "@/lib/api-response";

const feedbackCategories = [
  { value: "product", label: "Product" },
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature request" },
  { value: "other", label: "Other" },
] as const;

type FeedbackCategory = (typeof feedbackCategories)[number]["value"];

export function FeedbackSection() {
  const { getToken } = useAuth();
  const [category, setCategory] = useState<FeedbackCategory>("product");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (message.trim().length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData(event.currentTarget);
      const response = await apiFetch(
        "/feedback",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            message: message.trim(),
            email: email.trim(),
            pagePath: window.location.pathname,
            website: String(formData.get("website") ?? ""),
          }),
        },
        getToken,
      );
      const data = (await response.json()) as { ok: true } | { error?: string };

      if (!response.ok) {
        throw new Error(getApiError(data, "Could not submit feedback"));
      }

      setCategory("product");
      setMessage("");
      setEmail("");
      toast.success("Feedback received. Thank you.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not submit feedback",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="feedback"
      className="scroll-mt-12 px-4 py-16 sm:px-6 lg:px-8 lg:py-14"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-primary tracking-wider">
            FEEDBACK
          </p>
          <h2 className="max-w-xl text-[22px] font-semibold tracking-tight ">
            Help shape what GitLoud builds next.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Report a problem, request a feature, or tell us where the workflow
            feels slow. Specific feedback helps us prioritize improvements that
            matter to developers using the product.
          </p>

          <div className="flex gap-3 rounded-sm border bg-background py-2 px-3 text-xs leading-6 text-muted-foreground shadow-xs">
            Do not include repository secrets, API keys, passwords, or private
            source code in your message.
          </div>
        </div>

        <form
          className="space-y-5 rounded-sm border border-border bg-background p-5 shadow-sm sm:p-6"
          onSubmit={submitFeedback}
        >
         
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium uppercase">
              Feedback type
            </legend>
            <div className=" grid grid-cols-2 gap-2 sm:grid-cols-4">
              {feedbackCategories.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={category === option.value ? "default" : "outline"}
                  size="sm"
                  className="w-full truncate text-xs"
                  aria-pressed={category === option.value}
                  disabled={submitting}
                  onClick={() => setCategory(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="feedback-message" className="text-sm font-medium">
              Message
            </label>
            <textarea
              id="feedback-message"
              className="mt-2 min-h-32 w-full resize-y rounded-none border border-input bg-transparent px-2.5 py-3 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-0 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
              placeholder="What happened, what did you expect, or what should GitLoud add?"
              minLength={10}
              maxLength={2000}
              required
              disabled={submitting}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <p className="text-right text-xs text-muted-foreground">
              <span className="mt-0.5 text-muted-foreground text-xs tracking-tight">
                Minimum of 10 characters required to submit:
              </span>{" "}
              {message.length}/2000
            </p>
          </div>

          <div>
            <label htmlFor="feedback-email" className="text-sm font-medium">
              Contact email{" "}
              <span className="text-muted-foreground text-xs tracking-tight">
                (optional)
              </span>
            </label>
            <Input
              id="feedback-email"
              type="email"
              className="rounded-none mt-2"
              placeholder="you@example.com"
              maxLength={320}
              disabled={submitting}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="hidden" aria-hidden="true">
            <label htmlFor="feedback-website">Website</label>
            <input
              id="feedback-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting || message.trim().length < 10}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            SEND FEEDBACK
          </Button>
        </form>
      </div>
    </section>
  );
}
