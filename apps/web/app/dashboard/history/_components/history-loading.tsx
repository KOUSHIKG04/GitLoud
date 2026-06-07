import { LoaderCircle } from "lucide-react";

export function HistoryLoading() {
  return (
    <div
      className="flex min-h-64 flex-1 items-center justify-center"
      role="status"
      aria-label="Loading history"
    >
      <LoaderCircle
        className="size-9 animate-spin text-primary sm:size-10"
        aria-hidden="true"
      />
    </div>
  );
}
