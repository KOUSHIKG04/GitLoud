"use client";

import { Header } from "@/components/Header";
import { Dithering } from "@paper-design/shaders-react";
import { useTheme } from "@/lib/theme-provider";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const colorBack = isDark ? "#0a0a0a" : "#ffffff";
  const colorFront = isDark ? "#ffdf2082" : "#0284c7";

  return (
    <main className="min-h-screen">
      <Header />

      <section className="grid min-h-[calc(100vh-4rem)] md:grid-cols-[1fr_1px_1fr]">
        <div className="relative hidden overflow-hidden md:flex items-center justify-center">
          <Dithering
            className="absolute inset-0 h-full w-full"
            colorBack={colorBack}
            colorFront={colorFront}
            shape="warp"
            type="2x2"
            size={2}
            speed={0.4}
            scale={0.5}
            offsetY={0.8}
          />

          <div className="relative z-10 text-center perspective-distant transform-3d">
            <div className="relative z-10 max-w-md space-y-8 text-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.3em] text-chart-1">
                  Gitloud
                </p>

                <p className="mt-5 text-md uppercase leading-7">
                  Tool that turns your GitHub work into release notes,
                  changelogs, summaries and other content.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block bg-border" />

        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm">
            {children}</div>
        </div>
      </section>
    </main>
  );
}
