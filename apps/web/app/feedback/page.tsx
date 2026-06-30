"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeedbackSection } from "./FeedBackSection";

export default function FeedbackPage() {
  return (
    <main className="min-h-dvh flex flex-col ">
      <Header />
      <div className="grow ">
        <FeedbackSection />
      </div>
      <Footer />
    </main>
  );
}
