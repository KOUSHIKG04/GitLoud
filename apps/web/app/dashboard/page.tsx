import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PrForm } from "@/dashboard/pr-form";

export default function DashboardPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
        <section className="w-full max-w-2xl space-y-8">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl mt-2">
              GENERATE CONTENT THROUGH{" "}
              <span className="text-chart-3 m-0 p-0">PR</span> BELOW
            </h1>
          </div>

          <div>
            <PrForm />
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Paste a public GitHub pull request link to start generating
            summaries and share-ready posts.
          </p>
        </section>
      </div>

      <Footer />
    </main>
  );
}
