import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeedbackSection } from "./FeedBackSection";
import { PageStructuredData } from "@/components/seo/PageStructuredData";

const title = "Product Feedback and Developer Feature Requests";
const description =
  "Share product feedback, report bugs, or request features that improve GitHub content generation, repository workflows, publishing, and the developer experience.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/feedback",
  },
};

export default function FeedbackPage() {
  return (
    <>
      <PageStructuredData
        name={`${title} | GitLoud`}
        description={description}
        path="/feedback"
        pageType="ContactPage"
      />
      <main className="min-h-dvh flex flex-col overflow-x-hidden">
        <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background flex flex-col grow">
          <Header />
          <div className="grow">
            <FeedbackSection />
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
