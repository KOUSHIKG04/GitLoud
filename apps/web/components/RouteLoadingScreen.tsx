import { AppLogo } from "@/assets/AppLogo";

export function RouteLoadingScreen({
  label = "Preparing GitLoud",
}: {
  label?: string;
}) {
  return (
    <main className="fixed inset-0 z-50 isolate flex min-h-dvh animate-[gitloud-loader-in_420ms_ease-out_both] items-start justify-center overflow-hidden bg-background px-4 pt-[40dvh] text-foreground">
      <section className="flex max-w-full flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-3">
        <AppLogo className="size-10 shrink-0 animate-pulse sm:size-12" />

        <p className="whitespace-nowrap font-mono text-[clamp(1.35rem,7vw,2.25rem)] font-semibold tracking-normal text-foreground sm:text-4xl">
          {label}
        </p>
      </section>
    </main>
  );
}
