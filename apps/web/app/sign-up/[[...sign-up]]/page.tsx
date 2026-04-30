import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { authAppearance } from "@/components/auth/clerkAppearance";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a GitLoud account to generate and save GitHub content.",
};

export default async function SignUpPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <AuthShell eyebrow="Create your account" title="Start using GitLoud">
      <SignUp
        appearance={authAppearance}
        fallbackRedirectUrl="/?auth=sign-up"
        forceRedirectUrl="/?auth=sign-up"
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
      />
    </AuthShell>
  );
}
