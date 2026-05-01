import { Header } from "@/components/Header";

export function AuthShell({
  children,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
}) {
  return (
    <main className="auth-shell min-h-screen bg-background">
      <Header />

      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-[0.9fr_1.1fr] md:items-center lg:px-8">
        <div className="space-y-2">
          <p className="text-md font-semibold">{eyebrow}</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Generate summaries, changelog entries, portfolio bullets, and
            share-ready posts from public GitHub pull requests and commits.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
