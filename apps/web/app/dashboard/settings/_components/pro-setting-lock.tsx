import { BillingActions } from "@/components/BillingActions";
import { Lock } from "lucide-react";

export function ProSettingLock({ description }: { description: string }) {
  return (
    <section className="flex min-h-[28rem] items-center justify-center border bg-card p-6 text-card-foreground shadow-sm">
      <div className="w-full max-w-md space-y-5 text-center">
        <div className="mx-auto flex size-12 items-center justify-center border bg-background text-muted-foreground">
          <Lock className="size-5" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">
            Pro setting locked
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        <BillingActions />
      </div>
    </section>
  );
}
