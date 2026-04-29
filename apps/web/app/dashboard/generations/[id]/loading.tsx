import { Header } from "@/components/Header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen">
      <Header />

      <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-full max-w-2xl" />
          <Skeleton className="h-4 w-52" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-9 w-full sm:w-32" />
          <Skeleton className="h-9 w-full sm:w-24" />
        </div>

        <div className="border-t pt-6">
          <Skeleton className="h-6 w-44" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <section key={index} className="rounded-xl border bg-card p-4">
              <Skeleton className="h-4 w-36" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-8 w-full sm:size-9" />
                <Skeleton className="h-8 w-full sm:size-9" />
                <Skeleton className="h-8 w-full sm:size-9" />
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
