"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * Renders the SSO authentication redirection callback page from Clerk.
 *
 * @returns React redirect callback layout.
 */
export default function SsoCallbackPage() {
  return <AuthenticateWithRedirectCallback />;
}
