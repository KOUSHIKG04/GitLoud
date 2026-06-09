"use client";

import { BillingActions } from "@/components/BillingActions";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  Check,
  CreditCard,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { SubscriptionActions } from "./subscription-actions";
import type { BillingDetailsResponse } from "@repo/shared/billing";

const PRO_FEATURES = [
  "Private repository access through the GitHub App",
  "Generate from synced commits and pull requests",
  "Use your own supported AI provider key",
];

export function BillingClient() {
  const { getToken } = useAuth();
  const [status, setStatus] = useState<BillingDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStatus = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await apiFetch("/billing/details", {}, getToken);
        const data = (await response.json()) as BillingDetailsResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not load billing status");
        }

        setStatus(data);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Could not load billing status",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getToken],
  );

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  if (loading) {
    return (
      <div
        className="flex min-h-64 items-center justify-center"
        role="status"
        aria-label="Loading billing"
      >
        <LoaderCircle className="size-9 animate-spin text-primary" />
      </div>
    );
  }

  if (!status) {
    return (
      <section className="border border-border p-5">
        <p className="text-sm text-muted-foreground">
          Billing information is unavailable.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => void loadStatus()}
        >
          TRY AGAIN
        </Button>
      </section>
    );
  }

  const hasPaidPlan = status.plan === "PRO";
  const expiry = status.planExpiresAt ? new Date(status.planExpiresAt) : null;
  const daysRemaining = expiry
    ? Math.max(0, Math.ceil((expiry.getTime() - Date.now()) / 86_400_000))
    : 0;

  return (
    <div className="space-y-5">
      <section className="border border-border bg-card text-card-foreground">
        <div className="grid sm:grid-cols-[minmax(0,1fr)_minmax(16rem,0.65fr)]">
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-primary" />
                <h2 className="font-semibold">CURRENT PLAN</h2>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Refresh billing status"
                title="Refresh billing status"
                disabled={refreshing}
                onClick={() => void loadStatus(true)}
              >
                <RefreshCw
                  className={refreshing ? "size-4 animate-spin" : "size-4"}
                />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-semibold">{status.plan}</span>
              {hasPaidPlan ? (
                <span className="border border-primary/40 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                  ACTIVE
                </span>
              ) : null}
            </div>
            <p className="max-w-xl text-sm text-muted-foreground">
              {hasPaidPlan
                ? "Pro costs $14 per month. One-time access lasts 30 days and does not renew automatically."
                : "Upgrade to unlock private repositories, GitHub activity generation, and custom AI keys."}
            </p>
          </div>

          <div className="grid border-t border-border sm:border-l sm:border-t-0">
            <BillingDetail
              icon={CalendarClock}
              label={hasPaidPlan ? "Access ends" : "Access period"}
              value={
                expiry
                  ? `${formatDate(expiry)} (${daysRemaining} days remaining)`
                  : "No active paid period"
              }
            />
            <BillingDetail
              icon={CreditCard}
              label="Billing provider"
              value={formatProvider(status.billingProvider)}
            />
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="border border-border bg-card p-5 text-card-foreground">
          <h2 className="font-semibold">PLAN INCLUDES</h2>
          <div className="mt-4 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <BillingActions
            buttonLabel={
              hasPaidPlan ? "RENEW PRO FOR 30 DAYS" : "UPGRADE TO PRO"
            }
            className="mt-5"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            One-time renewal costs $14 and adds 30 days after your current
            access end date.
          </p>
        </section>

        <section className="border border-border bg-card p-5 text-card-foreground">
          <div className="flex items-center gap-2">
            <ReceiptText className="size-5 text-primary" />
            <h2 className="font-semibold">LATEST PAYMENT</h2>
          </div>

          {status.payment ? (
            <dl className="mt-4 space-y-3 text-sm">
              <PaymentRow label="Status" value={status.payment.status} />
              <PaymentRow label="Amount" value={formatAmount(status.payment)} />
              <PaymentRow
                label="Method"
                value={status.payment.method?.toUpperCase() ?? "Unavailable"}
              />
              <PaymentRow
                label="Paid on"
                value={
                  status.payment.createdAt
                    ? formatDate(new Date(status.payment.createdAt))
                    : "Unavailable"
                }
              />
              <PaymentRow label="Reference" value={status.payment.id} mono />
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No verified Razorpay payment is associated with this account.
            </p>
          )}
        </section>
      </div>

      <section className="border border-border bg-card p-5 text-card-foreground">
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.45fr)] sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <RefreshCw className="size-5 text-primary" />
              <h2 className="font-semibold">AUTO RENEWAL</h2>
              <span className="border border-border px-2 py-0.5 text-[10px] font-semibold uppercase">
                {getSubscriptionLabel(status.subscription)}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {getSubscriptionDescription(status.subscription)}
            </p>
            {status.subscription.nextChargeAt ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Next charge:{" "}
                {formatDate(new Date(status.subscription.nextChargeAt))}
              </p>
            ) : null}
            {!status.subscription.configured ? (
              <p className="mt-2 text-xs text-destructive">
                Add RAZORPAY_PRO_PLAN_ID to the API environment to enable
                subscriptions.
              </p>
            ) : null}
          </div>

          <SubscriptionActions
            configured={status.subscription.configured}
            hasSubscription={isManagedSubscription(status.subscription.status)}
            cancelAtPeriodEnd={status.subscription.cancelAtPeriodEnd}
            onChanged={() => loadStatus(true)}
          />
        </div>
      </section>
    </div>
  );
}

function BillingDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 border-b border-border p-5 last:border-b-0">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function PaymentRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={
          mono
            ? "break-all text-right font-mono text-xs"
            : "text-right font-medium"
        }
      >
        {value}
      </dd>
    </div>
  );
}

function formatProvider(provider: BillingDetailsResponse["billingProvider"]) {
  if (provider === "RAZORPAY") {
    return "Razorpay";
  }

  if (provider === "MANUAL") {
    return "Manual";
  }

  return "Not configured";
}

function formatAmount(payment: NonNullable<BillingDetailsResponse["payment"]>) {
  if (payment.amount === null || !payment.currency) {
    return "Unavailable";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: payment.currency,
  }).format(payment.amount / 100);
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function isManagedSubscription(status: string | null) {
  return (
    status === "created" ||
    status === "authenticated" ||
    status === "active" ||
    status === "pending" ||
    status === "halted"
  );
}

function getSubscriptionLabel(
  subscription: BillingDetailsResponse["subscription"],
) {
  if (subscription.cancelAtPeriodEnd) {
    return "Ending";
  }

  if (subscription.status === "active") {
    return "Active";
  }

  if (
    subscription.status === "created" ||
    subscription.status === "authenticated"
  ) {
    return "Pending";
  }

  return "Off";
}

function getSubscriptionDescription(
  subscription: BillingDetailsResponse["subscription"],
) {
  if (subscription.cancelAtPeriodEnd) {
    return "Your current access remains available, but automatic charging will stop after this billing period.";
  }

  if (isManagedSubscription(subscription.status)) {
    return "Razorpay will charge the saved payment mandate each month until you cancel.";
  }

  return "Enable monthly automatic renewal so Pro access continues without manual payments.";
}
