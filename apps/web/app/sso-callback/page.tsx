import type { Metadata } from "next";
import { SsoCallbackClient } from "./sso-callback-client";

export const metadata: Metadata = {
  title: "Completing sign in",
  description: "Complete your GitLoud single sign-on authentication.",
};

/**
 * Renders the SSO authentication redirection callback page from Clerk.
 *
 * @returns React redirect callback layout.
 */
export default function SsoCallbackPage() {
  return <SsoCallbackClient />;
}
