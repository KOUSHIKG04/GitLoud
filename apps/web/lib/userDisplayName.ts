/**
 * Helper to determine a display name for a user based on Clerk attributes.
 * Falls back to username, email name, or "User" in descending order.
 *
 * @param options - Name retrieval inputs.
 * @param options.fullName - The user's full name.
 * @param options.metadata - Unsafe metadata potentially containing a displayName.
 * @param options.username - The user's username.
 * @param options.email - The user's primary email.
 * @returns The resolved user display name.
 */
export function getUserDisplayName({
  fullName,
  metadata,
  username,
  email,
}: {
  fullName?: string | null;
  metadata?: unknown;
  username?: string | null;
  email?: string | null;
}) {
  const normalizedEmail = email?.trim().toLowerCase();
  const trimmedName = fullName?.trim();

  if (trimmedName && trimmedName.toLowerCase() !== normalizedEmail) {
    return trimmedName;
  }

  const metadataDisplayName = getMetadataDisplayName(metadata);

  if (metadataDisplayName && metadataDisplayName.toLowerCase() !== "gitloud") {
    return metadataDisplayName;
  }

  const trimmedUsername = username?.trim();

  if (trimmedUsername && trimmedUsername.toLowerCase() !== "gitloud") {
    return trimmedUsername;
  }

  const emailName = email?.split("@")[0]?.trim();

  return emailName || "User";
}

/**
 * Extracts the display name attribute from unsafe Clerk user metadata if present.
 *
 * @param metadata - The user's unsafe metadata object.
 * @returns The display name string if valid, otherwise undefined.
 */
function getMetadataDisplayName(metadata: unknown) {
  if (typeof metadata !== "object" || metadata === null) {
    return undefined;
  }

  const displayName = (metadata as { displayName?: unknown }).displayName;

  return typeof displayName === "string" && displayName.trim()
    ? displayName.trim()
    : undefined;
}
