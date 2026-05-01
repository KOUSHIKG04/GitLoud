import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { getCurrentSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a GitLoud account to generate and save GitHub content.",
};

export default async function SignUpPage({
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
    <AuthShell eyebrow="Create your account" title="Start using GitLoud">
      <AuthForm mode="sign-up" callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
