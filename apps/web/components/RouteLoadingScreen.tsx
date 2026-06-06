import { AppLogo } from "@/assets/AppLogo";
import { LiquidEther } from "@repo/ui/components/liquid-ether";

export function RouteLoadingScreen({
  label = "Preparing GitLoud",
}: {
  label?: string;
}) {
  return (
    <main className="fixed inset-0 z-50 isolate flex min-h-dvh animate-[gitloud-loader-in_420ms_ease-out_both] items-start justify-center overflow-hidden bg-background px-4 pt-[40dvh] text-foreground">
      <LiquidEther className="fixed inset-0 -z-10 opacity-80" />

      <section className="flex max-w-full flex-col items-center justify-center gap-4 text-center sm:flex-row sm:gap-3">
        <AppLogo className="size-10 shrink-0 animate-pulse sm:size-12" />

        <p className="whitespace-nowrap font-mono text-2xl font-semibold tracking-normal text-foreground sm:text-4xl">
          {label}
        </p>

        <div className="relative flex h-16 min-w-64 translate-y-4 items-center justify-center overflow-hidden font-mono text-3xl font-semibold text-foreground sm:h-20 sm:min-w-72 sm:text-4xl">
          <span className="gitloud-status-word">Frontend ...</span>
          <span className="gitloud-status-word">API ...</span>
          <span className="gitloud-status-word">Backend ...</span>
        </div>
      </section>
    </main>
  );
}
