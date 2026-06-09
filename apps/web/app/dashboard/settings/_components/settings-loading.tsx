import { LoaderCircle } from "lucide-react";

export function SettingsLoading() {
  return (
    <output
      className="flex min-h-64 items-center justify-center"
      aria-label="Loading settings"
    >
      <LoaderCircle
        className="size-9 animate-spin text-primary sm:size-10"
        aria-hidden="true"
      />
    </output>
  );
}
