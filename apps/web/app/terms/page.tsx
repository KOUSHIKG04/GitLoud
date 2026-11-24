import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { TermsContent } from "@/features/legal/components/terms-content";

const title = "Terms of Service and Responsible Platform Use";
const description =
  "Review terms governing GitLoud accounts, authorized repository access, AI-generated content, acceptable use, service availability, and user responsibilities.";

export const metadata: Metadata = buildPageMetadata({
  title: title,
  description: description,
  path: "/terms",
});

export default function TermsPage() {
  return (
    <>
      <PageStructuredData
        name={`${title} | GitLoud`}
        description={description}
        path="/terms"
      />
      <main className="min-h-dvh text-foreground">
        <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background">
          <Header />

          <TermsContent />
        </div>
        <Footer />
      </main>
    </>
  );
}
