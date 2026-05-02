"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/lib/auth-client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type AuthFormProps = {
  callbackUrl?: string;
  initialNotice?: string;
  mode: "sign-in" | "sign-up";
};

export function AuthForm({
  callbackUrl: callbackUrlProp,
  initialNotice,
  mode,
}: AuthFormProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<"email" | "github" | null>(
    null,
  );
  const [notice, setNotice] = useState<string | null>(initialNotice ?? null);
  const [showPassword, setShowPassword] = useState(false);
  const isSignUp = mode === "sign-up";
  const callbackUrl = getSafeCallbackUrl(callbackUrlProp);
  const isSubmitting = loadingAction !== null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoadingAction("email");
    setNotice(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");
    const toastId = toast.loading(
      isSignUp ? "Creating account..." : "Signing in...",
    );

    try {
      const result = isSignUp
        ? await signUp.email({
            name,
            email,
            password,
            callbackURL: "/?verified=1",
          })
        : await signIn.email({
            email,
            password,
            callbackURL: callbackUrl,
          });

      if (result.error) {
        toast.error(getAuthErrorMessage(result.error, mode), {
          id: toastId,
          duration: 7000,
        });
        return;
      }

      if (isSignUp) {
        const message = "CHECK YOUR INBOX TO VERIFY YOUR EMAIL, THEN SIGN-IN";
        setNotice(message);
        toast.dismiss(toastId);
        return;
      } else {
        toast.success("Signed in", {
          id: toastId,
        });
      }
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      toast.error(getUnknownAuthErrorMessage(error, mode), {
        id: toastId,
        duration: 7000,
      });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handleGithubSignIn() {
    setLoadingAction("github");

    try {
      await signIn.social({
        provider: "github",
        callbackURL: callbackUrl,
        errorCallbackURL: mode === "sign-up" ? "/sign-up" : "/sign-in",
        newUserCallbackURL: callbackUrl,
      });
    } catch (error) {
      setLoadingAction(null);
      toast.error(
        error instanceof Error ? error.message : "GitHub sign in failed",
        { duration: 7000 },
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full border bg-card p-5 text-card-foreground shadow-sm"
    >
      <div className="space-y-5">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={handleGithubSignIn}
          className="w-full rounded-none"
        >
          {loadingAction === "github" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <span className="mr-1">
              <GitHubIcon />
            </span>
          )}
          CONTINUE WITH GITHUB
        </Button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {notice ? (
          <div
            className={[
              "border border-primary/40 bg-primary/10 px-3 py-2",
              "text-xs leading-5 text-foreground text-center",
            ].join(" ")}
          >
            {notice}
          </div>
        ) : null}

        {isSignUp ? (
          <div className="space-y-2">
            <Input
              id="name"
              name="name"
              autoComplete="name"
              required
              disabled={isSubmitting}
              className="rounded-none bg-background"
              placeholder="ENTER FULL NAME"
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={isSubmitting}
            className="rounded-none bg-background"
            placeholder="ENTER YOUR EMAIL (eg, xxxxx@gmail.com)"
          />
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              minLength={8}
              required
              disabled={isSubmitting}
              className="rounded-none bg-background pr-10"
              placeholder="ENTER PASSWORD"
            />
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setShowPassword((current) => !current)}
              className={[
                "absolute right-2 top-1/2 flex size-7 -translate-y-1/2",
                "items-center justify-center text-muted-foreground",
                "transition-colors hover:text-foreground",
                "disabled:pointer-events-none disabled:opacity-50",
              ].join(" ")}
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-none"
        >
          {loadingAction === "email" ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          {isSignUp ? "CREATE ACCOUNT" : "SIGN IN"}
        </Button>
      </div>

      <div className="mt-5 border-t pt-4 text-sm text-muted-foreground text-center">
        {isSignUp ? (
          <p>
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-foreground underline-offset-4 hover:underline"
            >
              SIGN IN
            </Link>
          </p>
        ) : (
          <p>
            New to GitLoud?{" "}
            <Link
              href="/sign-up"
              className="text-foreground underline-offset-4 hover:underline"
            >
              CREATE AN ACCOUNT
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}

function getSafeCallbackUrl(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

type BetterAuthClientError = {
  code?: string;
  message?: string;
  status?: number;
  statusText?: string;
};

function getAuthErrorMessage(
  error: BetterAuthClientError,
  mode: AuthFormProps["mode"],
) {
  const code = error.code?.toLowerCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";
  const statusText = error.statusText?.toLowerCase() ?? "";
  const combined = [code, message, statusText].join(" ");

  if (combined.includes("verify")) {
    return "Please verify your email address. We sent a verification link to your inbox.";
  }

  if (
    combined.includes("invalid") ||
    combined.includes("credential") ||
    combined.includes("password") ||
    combined.includes("not found") ||
    combined.includes("user_not_found") ||
    error.status === 401 ||
    error.status === 404
  ) {
    return mode === "sign-in"
      ? "Invalid email or password. If you do not have an account, create one first."
      : "Could not create account. Check your email and password, then try again.";
  }

  if (
    combined.includes("already") ||
    combined.includes("exists") ||
    combined.includes("duplicate") ||
    error.status === 409
  ) {
    return mode === "sign-up"
      ? "An account already exists for this email. Sign in instead."
      : "This account already exists. Sign in with your email and password.";
  }

  if (
    combined.includes("oauth") ||
    combined.includes("provider") ||
    combined.includes("account_linking")
  ) {
    return [
      "This email may already be linked to another sign-in method.",
      "Try GitHub or email/password.",
    ].join(" ");
  }

  if (error.message) {
    return error.message;
  }

  return mode === "sign-in"
    ? "Could not sign in. Check your email and password."
    : "Could not create account. Check the form and try again.";
}

function getUnknownAuthErrorMessage(
  error: unknown,
  mode: AuthFormProps["mode"],
) {
  if (error instanceof Error) {
    return getAuthErrorMessage({ message: error.message }, mode);
  }

  return mode === "sign-in"
    ? "Could not sign in. Check your email and password."
    : "Could not create account. Check the form and try again.";
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d={githubIconPath} />
    </svg>
  );
}

const githubIconPath = [
  "M12 .5A12 12 0 0 0 8.2 23.9c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.4-4-1.4",
  "-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2",
  "1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9",
  "0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2",
  "A11.5 11.5 0 0 1 12 6.8c1 0 2 .1 3 .4 2.3-1.5 3.3-1.2 3.3-1.2",
  ".7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9",
  ".4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .5Z",
].join(" ");
