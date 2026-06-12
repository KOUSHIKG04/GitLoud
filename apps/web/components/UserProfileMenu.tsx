"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { getUserDisplayName } from "@/lib/userDisplayName";
import { apiFetch } from "@/lib/api-client";
import { BadgeCheck, Bell, CreditCard, LogOut, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { useEffect, useState } from "react";
import { PaymentsComingSoon } from "@/components/PaymentsComingSoon";
import type { BillingStatusResponse } from "@repo/shared/billing";

export function UserProfileMenu({
  className,
  showLabel = false,
  accountMenu = false,
}: {
  className?: string;
  showLabel?: boolean;
  accountMenu?: boolean;
}) {
  const { push, refresh } = useRouter();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [plan, setPlan] = useState<string | null>(null);

  const email = user?.primaryEmailAddress?.emailAddress;
  const displayName = getUserDisplayName({
    fullName: user?.fullName,
    metadata: user?.unsafeMetadata,
    username: user?.username,
    email,
  });
  const initials = getInitials(displayName);
  const isPro = plan === "PRO";

  useEffect(() => {
    if (!accountMenu) {
      return;
    }

    let active = true;

    async function loadBillingStatus() {
      try {
        const response = await apiFetch("/billing/status", {}, getToken);

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as BillingStatusResponse;

        if (active) {
          setPlan(data.plan);
        }
      } catch {
        // Keep the account menu available when billing status cannot load.
      }
    }

    void loadBillingStatus();

    return () => {
      active = false;
    };
  }, [accountMenu, getToken]);

  async function handleLogout() {
    const toastId = toast.loading("Logging out...");

    try {
      await signOut();
      toast.success("Logged out", { id: toastId });
      push("/");
      refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not log out",
        { id: toastId, duration: 7000 },
      );
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className={cn(
            "flex size-[31px] items-center justify-center rounded-none border border-border bg-background p-0 outline-none ring-offset-background transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            showLabel && "h-9 w-full justify-start gap-2 px-2",
            className,
          )}
          aria-label="Open user menu"
          title="Open user menu"
        >
          <span
            className={cn(
              "flex size-full items-center justify-center bg-card text-xs font-semibold uppercase text-card-foreground",
              showLabel && "size-6 shrink-0",
            )}
          >
            {initials}
          </span>
          {showLabel ? (
            <span className="truncate text-sm font-medium">Profile</span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={accountMenu ? "end" : "center"}
        side={accountMenu ? "right" : "bottom"}
        sideOffset={16}
        className={cn("mt-1.5 w-56 rounded-none", accountMenu && "w-48 p-0")}
      >
        {accountMenu ? (
          <AccountMenuHeader
            displayName={displayName}
            email={email}
            initials={initials}
          />
        ) : (
          <>
            <DropdownMenuLabel className="truncate">
              {displayName}
            </DropdownMenuLabel>
            {email ? (
              <DropdownMenuLabel className="truncate pt-0 text-[11px] font-normal">
                {email}
              </DropdownMenuLabel>
            ) : null}
          </>
        )}
        <DropdownMenuSeparator className={cn(accountMenu && "my-0")} />
        {accountMenu ? (
          <>
            {plan !== null && !isPro ? (
              <>
                <div className="p-1">
                  <PaymentsComingSoon>
                    <DropdownMenuItem
                      className="h-9 rounded-none text-sm font-medium"
                      disabled
                    >
                      <Sparkles />
                      Upgrade to Pro
                    </DropdownMenuItem>
                  </PaymentsComingSoon>
                </div>
                <DropdownMenuSeparator className="my-0" />
              </>
            ) : null}
            <div className="p-1">
              <DropdownMenuItem className="h-8 rounded-none" disabled>
                <BadgeCheck />
                Account
                <span className="ms-auto text-[10px] uppercase text-muted-foreground">
                  Soon
                </span>
              </DropdownMenuItem>
              {isPro ? (
                <DropdownMenuItem
                  className="h-8 cursor-pointer rounded-none"
                  onSelect={() => push("/dashboard/billing")}
                >
                  <CreditCard />
                  Billing
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem className="h-8 rounded-none" disabled>
                <Bell />
                Notifications
                <span className="ms-auto text-[10px] uppercase text-muted-foreground">
                  Soon
                </span>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="my-0" />
          </>
        ) : null}
        <DropdownMenuItem
          variant="destructive"
          className={cn(
            "rounded-none focus:rounded-none data-highlighted:rounded-none",
            accountMenu && "m-1 h-8",
          )}
          onSelect={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
        >
          <LogOut className="size-3 mt-0.5" />
          LOGOUT
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AccountMenuHeader({
  displayName,
  email,
  initials,
}: {
  displayName: string;
  email?: string;
  initials: string;
}) {
  return (
    <DropdownMenuLabel className="flex items-center gap-2.5 p-2.5 font-normal">
      <span className="flex size-9 shrink-0 border-border border items-center justify-center bg-card text-xs font-semibold uppercase text-card-foreground">
        {initials}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold text-foreground">
          {displayName}
        </span>
        {email ? (
          <span className="block truncate text-xs text-muted-foreground">
            {email}
          </span>
        ) : null}
      </span>
    </DropdownMenuLabel>
  );
}

function getInitials(value: string) {
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}
