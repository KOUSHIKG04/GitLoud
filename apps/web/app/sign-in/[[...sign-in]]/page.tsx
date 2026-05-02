import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { authAppearance } from "@/components/auth/clerkAppearance";

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
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to GitLoud">
      <SignIn
        appearance={authAppearance}
        fallbackRedirectUrl={callbackUrl ?? "/?auth=sign-in"}
        forceRedirectUrl={callbackUrl ?? "/?auth=sign-in"}
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />
    </AuthShell>
  );
}
