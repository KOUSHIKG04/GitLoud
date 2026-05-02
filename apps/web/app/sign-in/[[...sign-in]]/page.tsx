import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { EmailCodeAuthForm } from "@/components/auth/EmailCodeAuthForm";

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
  const { callbackUrl, redirect_url: redirectUrl } = await searchParams;
  const { userId } = await auth();

  const requestedUrl = callbackUrl ?? redirectUrl;
  const isSafeRedirect =
    typeof requestedUrl === "string" &&
    requestedUrl.startsWith("/") &&
    !requestedUrl.startsWith("//") &&
    !requestedUrl.startsWith("/\\");
  const afterAuthUrl = isSafeRedirect ? requestedUrl : "/?auth=sign-in";

  if (userId) {
    redirect("/");
  }

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to GitLoud">
      <EmailCodeAuthForm mode="sign-in" redirectUrl={afterAuthUrl} />
    </AuthShell>
  );
}
