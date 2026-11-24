import { Skeleton } from "@repo/ui/components/skeleton";

// Page-shaped placeholder: the result's layout appears immediately while the
// generation loads, instead of a full-screen loader.
export default function Loading() {
  return (
    <main
      role="status"
      aria-label="Loading generation"
      className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-6"
    >
      <div className="space-y-2 px-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-28 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
      <span className="sr-only">Loading generation</span>
    </main>
  );
}
