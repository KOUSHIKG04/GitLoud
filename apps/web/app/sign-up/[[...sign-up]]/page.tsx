import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { authAppearance } from "@/components/auth/clerkAppearance";

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
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <AuthShell eyebrow="Create your account" title="Start using GitLoud">
      <SignUp
        appearance={authAppearance}
        fallbackRedirectUrl={callbackUrl ?? "/?auth=sign-up"}
        forceRedirectUrl={callbackUrl ?? "/?auth=sign-up"}
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
      />
    </AuthShell>
  );
}
