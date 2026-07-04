import { DotMatrixLoader } from "@/components/DotMatrixLoader";

export default function Loading() {
  return (
    <DotMatrixLoader
      className="fixed inset-0 z-50 isolate bg-background text-foreground min-h-dvh"
      label="Loading page"
    />
  );
}
