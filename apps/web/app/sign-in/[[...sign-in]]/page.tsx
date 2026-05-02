import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentSession } from "@/lib/session";

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
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const session = await getCurrentSession();

  if (session?.user) {
    redirect("/");
  }

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to GitLoud">
      <AuthForm mode="sign-in" callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
