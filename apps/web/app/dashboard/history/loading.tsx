import { Header } from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-40" />
          </div>

          <Skeleton className="h-9 w-full sm:w-32" />
        </div>

        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-5 w-full max-w-xl" />
                  <Skeleton className="h-3 w-44" />
                </div>

                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="size-8" />
                  <Skeleton className="size-8" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
