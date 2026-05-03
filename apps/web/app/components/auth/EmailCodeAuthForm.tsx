"use client";

import { GoogleIcon } from "@/assest/social-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

type AuthMode = "sign-in" | "sign-up";

export function EmailCodeAuthForm({
  mode,
  redirectUrl,
}: {
  mode: AuthMode;
  redirectUrl: string;
}) {
  const router = useRouter();
  const {
    isLoaded: isSignInLoaded,
    setActive: setSignInActive,
    signIn,
  } = useSignIn();
  const {
    isLoaded: isSignUpLoaded,
    setActive: setSignUpActive,
    signUp,
  } = useSignUp();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [step, setStep] = useState<"email" | "code">("email");
  const [pendingAction, setPendingAction] = useState<
    "email" | "google" | "code" | "resend" | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isPending = pendingAction !== null;

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    if (mode === "sign-in") {
      if (!isSignInLoaded || !signIn) {
        return;
      }

      setPendingAction("email");
      setErrorMessage(null);

      try {
        const attempt = await signIn.create({ identifier: email.trim() });
        const emailCodeFactor = attempt.supportedFirstFactors?.find(
          (factor) => factor.strategy === "email_code",
        );

        if (!emailCodeFactor || emailCodeFactor.strategy !== "email_code") {
          throw new Error(
            "Email code sign-in is not enabled for this account.",
          );
        }

        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });

        setCode("");
        setStep("code");
      } catch (error) {
        const message = getAuthErrorMessage(error);
        setErrorMessage(message);
        toast.error(message, { duration: 7000 });
      } finally {
        setPendingAction(null);
      }
      return;
    }

    if (!isSignUpLoaded || !signUp) {
      return;
    }

    if (!username.trim()) {
      const message = "Enter a username to create an account.";
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
      return;
    }

    if (!legalAccepted) {
      const message =
        "Accept the Terms and Privacy Policy to create an account.";
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
      return;
    }

    setPendingAction("email");
    setErrorMessage(null);

    try {
      await signUp.create({
        emailAddress: email.trim(),
        unsafeMetadata: {
          displayName: username.trim(),
        },
        legalAccepted,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setCode("");
      setStep("code");
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
    } finally {
      setPendingAction(null);
    }
  }

  async function continueWithGoogle() {
    let redirectUrlComplete: string;
    try {
      const resolvedRedirect = new URL(redirectUrl, window.location.origin);
      redirectUrlComplete =
        resolvedRedirect.origin === window.location.origin
          ? resolvedRedirect.toString()
          : new URL("/", window.location.origin).toString();
    } catch {
      redirectUrlComplete = new URL("/", window.location.origin).toString();
    }

    if (mode === "sign-in") {
      if (!isSignInLoaded || !signIn) {
        return;
      }

      setPendingAction("google");
      setErrorMessage(null);

      try {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete,
        });
      } catch (error) {
        const message = getAuthErrorMessage(error);
        setErrorMessage(message);
        toast.error(message, { duration: 7000 });
        setPendingAction(null);
      }
      return;
    }

    if (!isSignUpLoaded || !signUp) {
      return;
    }

    if (!legalAccepted) {
      const message =
        "Accept the Terms and Privacy Policy to create an account.";
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
      return;
    }

    setPendingAction("google");
    setErrorMessage(null);

    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete,
      });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
      setPendingAction(null);
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code.length < 6) {
      return;
    }

    setPendingAction("code");
    setErrorMessage(null);

    try {
      if (mode === "sign-in") {
        if (!isSignInLoaded || !signIn || !setSignInActive) {
          return;
        }

        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });

        if (result.status !== "complete" || !result.createdSessionId) {
          throw new Error("Could not complete sign in with this code.");
        }

        await setSignInActive({ session: result.createdSessionId });
      } else {
        if (!isSignUpLoaded || !signUp || !setSignUpActive) {
          return;
        }

        const result = await signUp.attemptEmailAddressVerification({
          code,
        });

        if (result.status === "missing_requirements") {
          if (isOnlyMissingPassword(result.missingFields)) {
            await signUp.create({
              emailAddress: email.trim(),
              unsafeMetadata: {
                displayName: username.trim(),
              },
              legalAccepted,
            });
            await signUp.prepareEmailAddressVerification({
              strategy: "email_code",
            });
            setCode("");

            const message =
              "Your previous code was created before passwordless sign-up was enabled. We sent a new verification code.";
            setErrorMessage(message);
            toast.info(message, { duration: 7000 });
            return;
          }

          const missingFields = result.missingFields.join(", ");
          throw new Error(
            missingFields
              ? `Could not complete sign up. Missing: ${missingFields}.`
              : "Could not complete sign up with this code.",
          );
        }

        if (result.status !== "complete" || !result.createdSessionId) {
          throw new Error("Could not complete sign up with this code.");
        }

        await setSignUpActive({ session: result.createdSessionId });
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
    } finally {
      setPendingAction(null);
    }
  }

  async function resendCode() {
    setCode("");
    setPendingAction("resend");
    setErrorMessage(null);

    try {
      if (mode === "sign-in") {
        if (!isSignInLoaded || !signIn) {
          return;
        }

        const emailCodeFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === "email_code",
        );

        if (!emailCodeFactor || emailCodeFactor.strategy !== "email_code") {
          throw new Error(
            "Email code sign-in is not enabled for this account.",
          );
        }

        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });
      } else {
        if (!isSignUpLoaded || !signUp) {
          return;
        }

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
    } finally {
      setPendingAction(null);
    }
  }

  const isSignIn = mode === "sign-in";

  return (
    <div className="border bg-card p-5 text-card-foreground shadow-sm">
      {step === "email" ? (
        <form className="space-y-3" onSubmit={submitEmail}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight text-center">
              {isSignIn ? "Sign-in with email" : "Create account"}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground text-center">
              {isSignIn
                ? "Enter your email and we will send a one-time code."
                : "Use your email to create an account and verify it with a one-time code."}
            </p>

            {!isSignIn ? (
              <label className="mt-6 mx-auto flex max-w-fit items-start justify-center gap-2 text-center text-xs leading-5 text-muted-foreground">
                <input
                  checked={legalAccepted}
                  className="mt-1 size-3 shrink-0 accent-primary"
                  disabled={isPending}
                  onChange={(event) => setLegalAccepted(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  I agree to GitLoud&apos;s{" "}
                  <a
                    aria-label="Read GitLoud Terms of Service"
                    className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                    href="/terms"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Terms
                  </a>{" "}
                  and{" "}
                  <a
                    aria-label="Read GitLoud Privacy Policy"
                    className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
                    href="/privacy"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>
            ) : null}
          </div>

          <div className="space-y-1.5 mt-6">
            {!isSignIn ? (
              <Input
                id="username"
                autoComplete="username"
                className="mb-3 rounded-none"
                disabled={isPending}
                onChange={(event) => setUsername(event.target.value)}
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
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ENTER YOUR EMAIL - (eg, you@example.com)"
              type="email"
              value={email}
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          {!isSignIn ? (
            <div
              id="clerk-captcha"
              className="h-0 overflow-hidden empty:hidden"
            />
          ) : null}

          <Button
            className="w-full"
            disabled={
              isPending ||
              !email.trim() ||
              (!isSignIn && (!username.trim() || !legalAccepted))
            }
            type="submit"
          >
            {pendingAction === "email" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isSignIn ? (
              "Send sign-in code"
            ) : (
              "Send verification code"
            )}
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button
            className="w-full"
            disabled={isPending || (!isSignIn && !legalAccepted)}
            onClick={continueWithGoogle}
            type="button"
            variant="outline"
          >
            {pendingAction === "google" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            CONTINUE WITH GOOGLE
          </Button>

          <AuthModeLink mode={mode} redirectUrl={redirectUrl} />
        </form>
      ) : (
        <form className="space-y-4" onSubmit={submitCode}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight text-center">
              Enter verification code
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              We sent a six-digit code to{" "}
              <span className="text-foreground">{email}</span>.
            </p>
          </div>

          <InputOTP
            disabled={isPending}
            maxLength={6}
            onChange={setCode}
            value={code}
          >
            <InputOTPGroup className="w-full justify-between">
              {Array.from({ length: 6 }).map((_, index) => (
                <InputOTPSlot key={index} index={index} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <Button
            className="w-full"
            disabled={isPending || code.length < 6}
            type="submit"
          >
            {pendingAction === "code" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isSignIn ? (
              "Sign in"
            ) : (
              "Verify and continue"
            )}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              disabled={isPending}
              onClick={() => {
                setCode("");
                setStep("email");
              }}
              type="button"
            >
              Change email
            </button>

            <button
              className="text-foreground underline-offset-4 hover:underline disabled:text-muted-foreground"
              disabled={isPending}
              onClick={resendCode}
              type="button"
            >
              {pendingAction === "resend" ? "Sending..." : "Resend code"}
            </button>
          </div>
        </form>
      )}
    </div>
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

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const maybeClerkError = error as {
      errors?: Array<{ message?: string; longMessage?: string }>;
    };
    const clerkMessage =
      maybeClerkError.errors?.[0]?.longMessage ??
      maybeClerkError.errors?.[0]?.message;

    if (clerkMessage) {
      return clerkMessage;
    }
  }

  return "Authentication failed. Please try again.";
}

function isOnlyMissingPassword(missingFields: string[]) {
  return missingFields.length === 1 && missingFields[0] === "password";
}
