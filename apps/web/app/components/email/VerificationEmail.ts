type VerificationEmailProps = {
  verificationUrl: string;
};

const fontFamily = [
  "ui-monospace",
  "SFMono-Regular",
  "Menlo",
  "Monaco",
  "Consolas",
  "monospace",
].join(", ");

export function VerificationEmail({ verificationUrl }: VerificationEmailProps) {
  const pageStyle = [
    `font-family: ${fontFamily}`,
    "background: #08080a",
    "color: #fafafa",
    "padding: 36px 18px",
    "line-height: 1.6",
  ].join("; ");
  const shellStyle = [
    "max-width: 640px",
    "margin: 0 auto",
    "border: 1px solid #2f2f36",
    "background: #101014",
  ].join("; ");
  const heroStyle = [
    "background: #18181b",
    "border-bottom: 1px solid #2f2f36",
    "padding: 30px 28px",
  ].join("; ");
  const panelStyle = "padding: 28px; background: #101014";
  const buttonStyle = [
    "display: inline-block",
    "border: 1px solid #facc15",
    "background: #facc15",
    "color: #111111",
    "padding: 12px 18px",
    "text-decoration: none",
    "font-weight: 700",
  ].join("; ");
  const featureStyle = [
    "border: 1px solid #2f2f36",
    "background: #18181b",
    "padding: 14px",
    "margin: 0 0 10px",
  ].join("; ");
  const mutedStyle = "font-size: 13px; color: #a1a1aa";

  return `
    <div style="${pageStyle}">
      <div style="${shellStyle}">
        <div style="${heroStyle}">
          <p style="${mutedStyle}; margin: 0 0 12px; letter-spacing: 2px;">
            GITLOUD
          </p>
          <h1 style="font-size: 28px; line-height: 1.2; margin: 0 0 14px;">
            Turn GitHub work into posts worth sharing.
          </h1>
          <p style="font-size: 15px; color: #d4d4d8; margin: 0;">
            Verify your email to unlock your dashboard, save generated content,
            and start turning public PRs and commits into summaries, changelogs,
            and dev-ready social posts.
          </p>
        </div>

        <div style="${panelStyle}">
         <p style="font-size: 16px; margin: 0 0 18px; text-align: center;">
         One last step: confirm this email address for your GitLoud account.
        </p>

          <p style="margin: 0 0 24px; text-align: center;">
            <a href="${verificationUrl}" style="display: inline-block; text-align: center; ${buttonStyle}">
              VERIFY EMAIL
            </a>
          </p>

          <div style="${featureStyle}">
            <strong style="display: block; margin: 0 0 4px;">
              Generate faster
            </strong>
            <span style="color: #d4d4d8; font-size: 13px;">
              Paste a public PR or commit and get share-ready content.
            </span>
          </div>

          <div style="${featureStyle}">
            <strong style="display: block; margin: 0 0 4px;">
              Keep your history
            </strong>
            <span style="color: #d4d4d8; font-size: 13px;">
              Save generations to revisit, copy, and regenerate later.
            </span>
          </div>

          <p style="${mutedStyle}; margin: 22px 0 8px;">
            This link expires soon. If the button does not work, paste this URL
            into your browser:
          </p>
          <p style="${mutedStyle}; word-break: break-all; margin: 0;">
            ${verificationUrl}
          </p>
        </div>

        <div style="border-top: 1px solid #2f2f36; padding: 18px 28px;">
          <p style="${mutedStyle}; margin: 0;">
            If you did not create a GitLoud account, you can ignore this email.
          </p>
        </div>
      </div>
    </div>
  `;
}

export function VerificationEmailText({
  verificationUrl,
}: VerificationEmailProps) {
  return [
    "GitLoud",
    "",
    "Turn GitHub work into posts worth sharing.",
    "",
    "Verify your email to unlock your dashboard, save generated content,",
    "and start turning public PRs and commits into summaries, changelogs,",
    "and dev-ready social posts.",
    "",
    "Verify your email:",
    verificationUrl,
    "",
    "If you did not create a GitLoud account, you can ignore this email.",
  ].join("\n");
}
