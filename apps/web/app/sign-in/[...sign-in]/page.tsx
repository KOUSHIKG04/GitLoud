import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { EmailCodeAuthForm } from "@/features/auth/components/email-code-auth-form";
import { getSafeRedirect } from "@/features/auth/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to GitLoud to generate and save GitHub content.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; redirect_url?: string }>;
}) {
  const [{ callbackUrl, redirect_url: redirectUrl }, { userId }] =
    await Promise.all([searchParams, auth()]);

  const afterAuthUrl = getSafeRedirect(callbackUrl, redirectUrl, "/?auth=sign-in");

  if (userId) {
    redirect(afterAuthUrl);
  }

  return (
    <AuthShell>
      <EmailCodeAuthForm mode="sign-in" redirectUrl={afterAuthUrl} />
    </AuthShell>
  );
}
