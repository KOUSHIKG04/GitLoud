"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useSignIn, useSignUp } from "@clerk/nextjs";
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
  const signInState = useSignIn();
  const signUpState = useSignUp();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      if (mode === "sign-in") {
        if (!signInState.isLoaded) {
          return;
        }

        const signIn = signInState.signIn;
        const attempt = await signIn.create({ identifier: email.trim() });
        const emailCodeFactor = attempt.supportedFirstFactors?.find(
          (factor) => factor.strategy === "email_code",
        );

        if (!emailCodeFactor || emailCodeFactor.strategy !== "email_code") {
          throw new Error("Email code sign-in is not enabled for this account.");
        }

        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });
      } else {
        if (!signUpState.isLoaded) {
          return;
        }

        const signUp = signUpState.signUp;
        await signUp.create({ emailAddress: email.trim() });
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }

      setCode("");
      setStep("code");
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
    } finally {
      setIsPending(false);
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (code.length < 6) {
      return;
    }

    setIsPending(true);
    setErrorMessage(null);

    try {
      if (mode === "sign-in") {
        if (!signInState.isLoaded) {
          return;
        }

        const result = await signInState.signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        });

        if (result.status !== "complete" || !result.createdSessionId) {
          throw new Error("Could not complete sign in with this code.");
        }

        await signInState.setActive({ session: result.createdSessionId });
      } else {
        if (!signUpState.isLoaded) {
          return;
        }

        const result =
          await signUpState.signUp.attemptEmailAddressVerification({ code });

        if (result.status !== "complete" || !result.createdSessionId) {
          throw new Error("Could not complete sign up with this code.");
        }

        await signUpState.setActive({ session: result.createdSessionId });
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
    } finally {
      setIsPending(false);
    }
  }

  async function resendCode() {
    setCode("");
    setIsPending(true);
    setErrorMessage(null);

    try {
      if (mode === "sign-in") {
        if (!signInState.isLoaded) {
          return;
        }

        const emailCodeFactor = signInState.signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === "email_code",
        );

        if (!emailCodeFactor || emailCodeFactor.strategy !== "email_code") {
          throw new Error("Email code sign-in is not enabled for this account.");
        }

        await signInState.signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        });
      } else {
        if (!signUpState.isLoaded) {
          return;
        }

        await signUpState.signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message, { duration: 7000 });
    } finally {
      setIsPending(false);
    }
  }

  const isSignIn = mode === "sign-in";

  return (
    <div className="border bg-card p-5 text-card-foreground shadow-sm">
      {step === "email" ? (
        <form className="space-y-4" onSubmit={submitEmail}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight">
              {isSignIn ? "Sign in with email" : "Create account"}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {isSignIn
                ? "Enter your email and we will send a one-time code."
                : "Use your email to create an account and verify it with a one-time code."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              autoComplete="email"
              className="rounded-none"
              disabled={isPending}
              inputMode="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              type="email"
              value={email}
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}

          <Button
            className="w-full"
            disabled={isPending || !email.trim()}
            type="submit"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : isSignIn ? (
              "Send sign-in code"
            ) : (
              "Send verification code"
            )}
          </Button>

          <AuthModeLink mode={mode} redirectUrl={redirectUrl} />
        </form>
      ) : (
        <form className="space-y-4" onSubmit={submitCode}>
          <div className="space-y-1.5">
            <h2 className="text-xl font-semibold tracking-tight">
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
            {isPending ? (
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
              Resend code
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function AuthModeLink({ mode, redirectUrl }: { mode: AuthMode; redirectUrl?: string }) {
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
