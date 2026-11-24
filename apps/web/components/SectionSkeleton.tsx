import { Skeleton } from "@repo/ui/components/skeleton";
import { cn } from "@repo/ui/lib/utils";

/**
 * A quiet placeholder shaped like a section: shows instantly while data loads,
 * instead of replacing the screen with a big loader.
 */
export function SectionSkeleton({
  label,
  rows = 3,
  rowClassName = "h-10",
  bordered = true,
  className,
}: {
  label: string;
  rows?: number;
  rowClassName?: string;
  bordered?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "space-y-3",
        bordered && "rounded-sm border border-border p-4",
        className,
      )}
    >
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} className={cn("w-full", rowClassName)} />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
