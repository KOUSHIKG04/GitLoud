"use client";

import { GoogleIcon } from "@/assets/social-icons";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@repo/ui/components/input-otp";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { FormEvent } from "react";
import {
  type AuthMode,
  type PendingAction,
  useEmailCodeAuthFormController,
} from "./use-email-code-auth-form-controller";

export function EmailCodeAuthForm({
  mode,
  redirectUrl,
}: {
  mode: AuthMode;
  redirectUrl: string;
}) {
  const {
    code,
    continueWithGoogle,
    email,
    errorMessage,
    isPending,
    isSignIn,
    legalAccepted,
    pendingAction,
    resendCode,
    setCode,
    setEmail,
    setLegalAccepted,
    setStep,
    setUsername,
    step,
    submitCode,
    submitEmail,
    username,
  } = useEmailCodeAuthFormController({ mode, redirectUrl });

  return (
    <div className="border bg-card p-5 text-card-foreground shadow-sm">
      {step === "email" ? (
        <EmailStep
          email={email}
          errorMessage={errorMessage}
          isPending={isPending}
          isSignIn={isSignIn}
          legalAccepted={legalAccepted}
          mode={mode}
          onContinueWithGoogle={continueWithGoogle}
          onEmailChange={setEmail}
          onLegalAcceptedChange={setLegalAccepted}
          onSubmit={submitEmail}
          onUsernameChange={setUsername}
          pendingAction={pendingAction}
          redirectUrl={redirectUrl}
          username={username}
        />
      ) : (
        <CodeStep
          code={code}
          email={email}
          errorMessage={errorMessage}
          isPending={isPending}
          isSignIn={isSignIn}
          onChangeEmail={() => {
            setCode("");
            setStep("email");
          }}
          onCodeChange={setCode}
          onResendCode={resendCode}
          onSubmit={submitCode}
          pendingAction={pendingAction}
        />
      )}
    </div>
  );
}

function EmailStep({
  email,
  errorMessage,
  isPending,
  isSignIn,
  legalAccepted,
  mode,
  onContinueWithGoogle,
  onEmailChange,
  onLegalAcceptedChange,
  onSubmit,
  onUsernameChange,
  pendingAction,
  redirectUrl,
  username,
}: {
  email: string;
  errorMessage: string | null;
  isPending: boolean;
  isSignIn: boolean;
  legalAccepted: boolean;
  mode: AuthMode;
  onContinueWithGoogle: () => void;
  onEmailChange: (value: string) => void;
  onLegalAcceptedChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUsernameChange: (value: string) => void;
  pendingAction: PendingAction;
  redirectUrl: string;
  username: string;
}) {
  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <h2 className="text-center text-xl font-semibold tracking-tight">
          {isSignIn ? "Sign-in with email" : "Create account"}
        </h2>
        <p className="text-center text-sm leading-6 text-muted-foreground">
          {isSignIn
            ? "Enter your email and we will send a one-time code."
            : "Use your email to create an account and verify it with a one-time code."}
        </p>

        {!isSignIn ? (
          <label className="mx-auto mt-6 flex max-w-fit items-start justify-center gap-2 text-center text-xs leading-5 text-muted-foreground">
            <input
              checked={legalAccepted}
              className="mt-1 size-3 shrink-0 accent-primary"
              disabled={isPending}
              onChange={(event) => onLegalAcceptedChange(event.target.checked)}
              type="checkbox"
            />
            <span>
              I agree to GitLoud&apos;s{" "}
              <Link className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary" href="/terms" target="_blank">
                Terms
              </Link>{" "}
              and{" "}
              <Link className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary" href="/privacy" target="_blank">
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        ) : null}
      </div>

      <div className="mt-6 space-y-1.5">
        {!isSignIn ? (
          <Input
            id="username"
            autoComplete="username"
            className="mb-3 rounded-none"
            disabled={isPending}
            onChange={(event) => onUsernameChange(event.target.value)}
            placeholder="CHOOSE A USERNAME"
            type="text"
            value={username}
          />
        ) : null}
        <Input
          id="email"
          autoComplete="email"
          className="rounded-none"
          disabled={isPending}
          inputMode="email"
          onChange={(event) => onEmailChange(event.target.value)}
          placeholder="ENTER YOUR EMAIL - (eg, you@example.com)"
          type="email"
          value={email}
        />
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      {!isSignIn ? <div id="clerk-captcha" className="h-0 overflow-hidden empty:hidden" /> : null}
      <Button className="w-full" disabled={isPending || !email.trim() || (!isSignIn && (!username.trim() || !legalAccepted))} type="submit">
        {pendingAction === "email" ? <Loader2 className="size-4 animate-spin" /> : isSignIn ? "Send sign-in code" : "Send verification code"}
      </Button>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <Button className="w-full" disabled={isPending || (!isSignIn && !legalAccepted)} onClick={onContinueWithGoogle} type="button" variant="outline">
        {pendingAction === "google" ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
        CONTINUE WITH GOOGLE
      </Button>
      <AuthModeLink mode={mode} redirectUrl={redirectUrl} />
    </form>
  );
}

function CodeStep({
  code,
  email,
  errorMessage,
  isPending,
  isSignIn,
  onChangeEmail,
  onCodeChange,
  onResendCode,
  onSubmit,
  pendingAction,
}: {
  code: string;
  email: string;
  errorMessage: string | null;
  isPending: boolean;
  isSignIn: boolean;
  onChangeEmail: () => void;
  onCodeChange: (value: string) => void;
  onResendCode: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  pendingAction: PendingAction;
}) {
  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <h2 className="text-center text-xl font-semibold tracking-tight">Enter verification code</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          We sent a six-digit code to <span className="text-foreground">{email}</span>.
        </p>
      </div>
      <InputOTP disabled={isPending} maxLength={6} onChange={onCodeChange} value={code}>
        <InputOTPGroup className="w-full justify-between">
          {["first", "second", "third", "fourth", "fifth", "sixth"].map(
            (key, index) => (
              <InputOTPSlot key={key} index={index} />
            ),
          )}
        </InputOTPGroup>
      </InputOTP>
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      <Button className="w-full" disabled={isPending || code.length < 6} type="submit">
        {pendingAction === "code" ? <Loader2 className="size-4 animate-spin" /> : isSignIn ? "Sign in" : "Verify and continue"}
      </Button>
      <div className="flex items-center justify-between text-sm">
        <button className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline" disabled={isPending} onClick={onChangeEmail} type="button">Change email</button>
        <button className="text-foreground underline-offset-4 hover:underline disabled:text-muted-foreground" disabled={isPending} onClick={onResendCode} type="button">
          {pendingAction === "resend" ? "Sending..." : "Resend code"}
        </button>
      </div>
    </form>
  );
}

function AuthModeLink({
  mode,
  redirectUrl,
}: {
  mode: AuthMode;
  redirectUrl?: string;
}) {
  const buildHref = (basePath: string) => {
    if (!redirectUrl) {
      return basePath;
    }
    return `${basePath}?redirect_url=${encodeURIComponent(redirectUrl)}`;
  };

  if (mode === "sign-in") {
    return (
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          className="text-foreground underline-offset-4 hover:underline"
          href={buildHref("/sign-up")}
        >
          Sign up
        </Link>
      </p>
    );
  }

  return (
    <p className="text-center text-sm text-muted-foreground">
      Already have an account?{" "}
      <Link
        className="text-foreground underline-offset-4 hover:underline"
        href={buildHref("/sign-in")}
      >
        Sign in
      </Link>
    </p>
  );
}
