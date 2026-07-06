import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailCodeAuthForm } from "@/components/auth/EmailCodeAuthForm";
import { getSafeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a GitLoud account to generate and save GitHub content.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; redirect_url?: string }>;
}) {
  const [
    { callbackUrl, redirect_url: redirectUrl },
    { userId },
  ] = await Promise.all([searchParams, auth()]);

  const afterAuthUrl = getSafeRedirect(callbackUrl, redirectUrl, "/?auth=sign-up");

  if (userId) {
    redirect(afterAuthUrl);
  }

  return (
    <AuthShell>
      <EmailCodeAuthForm mode="sign-up" redirectUrl={afterAuthUrl} />
    </AuthShell>
  );
}
