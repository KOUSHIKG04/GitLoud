import { LoaderCircle } from "lucide-react";

export function DashboardLoading({ label }: { label: string }) {
  return (
    <output
      className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center"
      aria-label={label}
    >
      <LoaderCircle
        className="size-9 animate-spin text-primary sm:size-10"
        aria-hidden="true"
      />
    </output>
  );
}
