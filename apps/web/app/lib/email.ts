import {
  VerificationEmail,
  VerificationEmailText,
} from "@/components/email/VerificationEmail";
import { logger } from "@/lib/logger";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM ?? "GitLoud <onboarding@resend.dev>";

const resend = resendApiKey ? new Resend(resendApiKey) : null;

function redactEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  if (localPart.length <= 2) return `***@${domain}`;
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

export async function sendVerificationEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}) {
  if (!resend) {
    logger.warn("RESEND_API_KEY is missing; email verification link was not sent", {
      to: redactEmail(to),
    });
    return;
  }

  const result = await resend.emails.send({
    from: emailFrom,
    to,
    subject: "Verify your GitLoud email",
    text: VerificationEmailText({ verificationUrl: url }),
    html: VerificationEmail({ verificationUrl: url }),
  });

  if (result.error) {
    logger.error("Verification email failed", {
      error: result.error.message,
      to: redactEmail(to),
    });
    return;
  }
}
