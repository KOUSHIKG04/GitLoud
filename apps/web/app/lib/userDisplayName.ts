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

  if (metadataDisplayName) {
    return metadataDisplayName;
  }

  const trimmedUsername = username?.trim();

  if (trimmedUsername) {
    return trimmedUsername;
  }

  const emailName = email?.split("@")[0]?.trim();

  return emailName || "User";
}

export function getMetadataDisplayName(metadata: unknown) {
  if (typeof metadata !== "object" || metadata === null) {
    return undefined;
  }

  const displayName = (metadata as { displayName?: unknown }).displayName;

  return typeof displayName === "string" && displayName.trim()
    ? displayName.trim()
    : undefined;
}
