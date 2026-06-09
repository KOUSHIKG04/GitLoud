import { BillingActions } from "@/components/BillingActions";
import { LockKeyhole } from "lucide-react";

export function ProAccessLock() {
  return (
    <section className="flex min-h-[28rem] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <LockKeyhole
          className="size-15 text-muted-foreground"
          aria-hidden="true"
        />
        <div className="flex gap-1 items-center justify-center text-muted-foreground">
          To unlock this feature
          <BillingActions
            buttonLabel="Upgrade to PRO"
            buttonVariant="link"
            className="mt-0 underline"
            showPaymentIcon={false}
          />
        </div>
      </div>
    </section>
  );
}
