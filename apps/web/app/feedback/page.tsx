import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeedbackSection } from "./FeedBackSection";

export const metadata: Metadata = {
  title: "Feedback - GitLoud",
  description: "Provide feedback, feature requests, or report issues regarding GitLoud.",
  alternates: {
    canonical: "/feedback",
  },
};

export default function FeedbackPage() {
  return (
    <main className="min-h-dvh flex flex-col overflow-x-hidden">
      <div className="w-full max-w-5xl mx-auto md:border-x md:border-border bg-background flex flex-col grow">
        <Header />
        <div className="grow">
          <FeedbackSection />
        </div>
      </div>
      <Footer />
    </main>
  );
}
