// The real worked example: output GitLoud generated from PR #43.
export const PR43_EXAMPLE = {
  number: 43,
  title:
    "feat: add WebAuthn (Passkey) support for biometric authentication (#43)",
  shortSummary:
    "Short Summary:\nThis pull request adds passkey (WebAuthn) authentication support to the application. It integrates the @simplewebauthn library, adds database schema changes to store credential public keys, and introduces API endpoints for credential registration and verification. This enables biometric logins like FaceID and TouchID alongside the existing passwordless email authentication.",
  changelogEntry:
    "### Added\n- Support for Passkey (WebAuthn) biometric authentication (FaceID, TouchID, Windows Hello).\n- Database schema updates for secure cryptographic credential storage.\n- API endpoints for registration and login challenges and verification.\n- User interface elements to register/sign in using passkeys.",
};
