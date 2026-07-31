import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SecurityPrivacyContent } from "./_components/security-privacy-content";
import { PageStructuredData } from "@/components/seo/PageStructuredData";

const title = "GitHub Repository Security and Privacy Practices";
const description =
  "Learn how GitLoud protects private repositories with read-only GitHub permissions, short-lived tokens, encrypted credentials, and user-controlled connections.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/security-and-privacy",
  },
};

type SecurityPageSearchParams = {
  tab?: string;
};

export default async function SecurityPage({
  searchParams,
}: {
  searchParams: Promise<SecurityPageSearchParams>;
}) {
  const { tab } = await searchParams;
  const initialTab = tab === "privacy" ? "privacy" : "security";

  return (
    <>
      <PageStructuredData
        name={`${title} | GitLoud`}
        description={description}
        path="/security-and-privacy"
      />
      <main className="min-h-dvh text-foreground">
        <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background">
          <Header />
          <SecurityPrivacyContent initialTab={initialTab} />
        </div>
        <Footer />
      </main>
    </>
  );
}
