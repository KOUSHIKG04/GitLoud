import type { Metadata } from "next";
import { BillingClient } from "./billing-client";

export const metadata: Metadata = {
  title: "Billing",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BillingPage() {
  return (
    <main className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
      <div className="flex flex-1 justify-center px-4 pb-6 sm:px-8">
        <section className="w-full max-w-4xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              BILLING
            </h1>
            <p className="text-sm text-muted-foreground">
              Review your plan, access period, and latest verified payment.
            </p>
          </div>

          <BillingClient />
        </section>
      </div>
    </main>
  );
}
