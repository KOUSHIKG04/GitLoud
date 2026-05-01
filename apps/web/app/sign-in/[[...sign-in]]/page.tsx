import type { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { authAppearance } from "@/components/auth/clerkAppearance";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to GitLoud to generate and save GitHub content.",
};

export default async function SignInPage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/");
  }

  return (
    <AuthShell eyebrow="Welcome back" title="Sign in to GitLoud">
      <SignIn
        appearance={authAppearance}
        fallbackRedirectUrl="/?auth=sign-in"
        forceRedirectUrl="/?auth=sign-in"
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
      />
    </AuthShell>
  );
}
