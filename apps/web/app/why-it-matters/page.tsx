import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhyDeveloperUpdatesMatterSection } from "@/components/home/WhyDeveloperUpdatesMatterSection";
import { PageStructuredData } from "@/components/seo/PageStructuredData";

const title = "Why Developer Updates Matter for Shipped Software";
const description =
  "Learn why turning GitHub pull requests and commits into clear developer updates improves technical context, release communication, and project visibility.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/why-it-matters",
  },
  openGraph: {
    title,
    description,
    url: "/why-it-matters",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/twitter-image"],
  },
};

export default function WhyItMattersPage() {
  return (
    <>
      <PageStructuredData
        name={`${title} | GitLoud`}
        description={description}
        path="/why-it-matters"
      />
      <main className="min-h-dvh">
        <div className="mx-auto w-full max-w-5xl bg-background md:border-x md:border-border">
          <Header />
          <WhyDeveloperUpdatesMatterSection />
        </div>
        <Footer />
      </main>
    </>
  );
}
