"use client";

import { useSignIn, useSignUp } from "@clerk/nextjs/legacy";
import { useRouter } from "next/navigation";
import { useReducer, type FormEvent } from "react";
import { toast } from "sonner";

export type AuthMode = "sign-in" | "sign-up";
export type PendingAction = "email" | "google" | "code" | "resend" | null;

type AuthFormState = {
  email: string;
  username: string;
  code: string;
  legalAccepted: boolean;
  step: "email" | "code";
  pendingAction: PendingAction;
  errorMessage: string | null;
};
type AuthFormAction =
  | { type: "email"; value: string }
  | { type: "username"; value: string }
  | { type: "code"; value: string }
  | { type: "legalAccepted"; value: boolean }
  | { type: "step"; value: "email" | "code" }
  | { type: "pendingAction"; value: PendingAction }
  | { type: "errorMessage"; value: string | null };

const initialAuthFormState: AuthFormState = {
  email: "",
  username: "",
  code: "",
  legalAccepted: false,
  step: "email",
  pendingAction: null,
  errorMessage: null,
};

function authFormReducer(
  state: AuthFormState,
  action: AuthFormAction,
): AuthFormState {
  return { ...state, [action.type]: action.value };
}

export function useEmailCodeAuthFormController({
  mode,
  redirectUrl,
}: {
  mode: AuthMode;
  redirectUrl: string;
}) {
  const { push, refresh } = useRouter();
  const { isLoaded: isSignInLoaded, setActive: setSignInActive, signIn } =
    useSignIn();
  const { isLoaded: isSignUpLoaded, setActive: setSignUpActive, signUp } =
    useSignUp();
  const [state, dispatch] = useReducer(authFormReducer, initialAuthFormState);
  const { email, username, code, legalAccepted, pendingAction } = state;
  const setEmail = (value: string) => dispatch({ type: "email", value });
  const setUsername = (value: string) => dispatch({ type: "username", value });
  const setCode = (value: string) => dispatch({ type: "code", value });
  const setLegalAccepted = (value: boolean) =>
    dispatch({ type: "legalAccepted", value });
  const setStep = (value: "email" | "code") => dispatch({ type: "step", value });
  const setPendingAction = (value: PendingAction) =>
    dispatch({ type: "pendingAction", value });
  const setErrorMessage = (value: string | null) =>
    dispatch({ type: "errorMessage", value });

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;

    if (mode === "sign-in") {
      if (!isSignInLoaded || !signIn) return;
      setPendingAction("email");
      setErrorMessage(null);
      try {
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
        setCode("");
        setStep("code");
      } catch (error) {
        showAuthError(error);
      } finally {
        setPendingAction(null);
      }
      return;
    }

    if (!isSignUpLoaded || !signUp) return;
    if (!username.trim()) return showMessage("Enter a username to create an account.");
    if (!legalAccepted) return showMessage("Accept the Terms and Privacy Policy to create an account.");

    setPendingAction("email");
    setErrorMessage(null);
    try {
      await signUp.create({
        emailAddress: email.trim(),
        unsafeMetadata: { displayName: username.trim() },
        legalAccepted,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setCode("");
      setStep("code");
    } catch (error) {
      showAuthError(error);
    } finally {
      setPendingAction(null);
    }
  }

  async function continueWithGoogle() {
    const redirectUrlComplete = getSafeRedirectUrl(redirectUrl);

    if (mode === "sign-in") {
      if (!isSignInLoaded || !signIn) return;
      setPendingAction("google");
      setErrorMessage(null);
      try {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete,
        });
      } catch (error) {
        showAuthError(error);
        setPendingAction(null);
      }
      return;
    }

    if (!isSignUpLoaded || !signUp) return;
    if (!legalAccepted) return showMessage("Accept the Terms and Privacy Policy to create an account.");
    setPendingAction("google");
    setErrorMessage(null);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete,
      });
    } catch (error) {
      showAuthError(error);
      setPendingAction(null);
    }
  }

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (code.length < 6) return;
    setPendingAction("code");
    setErrorMessage(null);
    try {
      if (mode === "sign-in") {
        if (!isSignInLoaded || !signIn || !setSignInActive) return;
        const result = await signIn.attemptFirstFactor({ strategy: "email_code", code });
        if (result.status !== "complete" || !result.createdSessionId) {
          throw new Error("Could not complete sign in with this code.");
        }
        await setSignInActive({ session: result.createdSessionId });
      } else {
        if (!isSignUpLoaded || !signUp || !setSignUpActive) return;
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === "missing_requirements") {
          if (isOnlyMissingPassword(result.missingFields)) {
            await signUp.create({
              emailAddress: email.trim(),
              unsafeMetadata: { displayName: username.trim() },
              legalAccepted,
            });
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setCode("");
            showMessage("Your previous code was created before passwordless sign-up was enabled. We sent a new verification code.", "info");
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
      push(redirectUrl);
      refresh();
    } catch (error) {
      showAuthError(error);
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
        if (!isSignInLoaded || !signIn) return;
        const emailCodeFactor = signIn.supportedFirstFactors?.find(
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
        if (!isSignUpLoaded || !signUp) return;
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      }
    } catch (error) {
      showAuthError(error);
    } finally {
      setPendingAction(null);
    }
  }

  function showAuthError(error: unknown) {
    showMessage(getAuthErrorMessage(error));
  }

  function showMessage(message: string, kind: "error" | "info" = "error") {
    setErrorMessage(message);
    toast[kind](message, { duration: 7000 });
  }

  return {
    ...state,
    isPending: pendingAction !== null,
    isSignIn: mode === "sign-in",
    continueWithGoogle,
    resendCode,
    setCode,
    setEmail,
    setLegalAccepted,
    setStep,
    setUsername,
    submitCode,
    submitEmail,
  };
}

function getSafeRedirectUrl(redirectUrl: string) {
  try {
    const resolvedRedirect = new URL(redirectUrl, window.location.origin);
    return resolvedRedirect.origin === window.location.origin
      ? resolvedRedirect.toString()
      : new URL("/", window.location.origin).toString();
  } catch {
    return new URL("/", window.location.origin).toString();
  }
}

function getAuthErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const maybeClerkError = error as {
      errors?: Array<{ message?: string; longMessage?: string }>;
    };
    const clerkMessage =
      maybeClerkError.errors?.[0]?.longMessage ??
      maybeClerkError.errors?.[0]?.message;
    if (clerkMessage) return clerkMessage;
  }
  return "Authentication failed. Please try again.";
}

function isOnlyMissingPassword(missingFields: string[]) {
  return missingFields.length === 1 && missingFields[0] === "password";
}
