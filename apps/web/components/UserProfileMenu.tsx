"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { useClerk, useUser } from "@clerk/nextjs";
import { getUserDisplayName } from "@/lib/userDisplayName";
import {
  // BadgeCheck, Bell,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";

export function UserProfileMenu({
  className,
  showLabel = false,
  accountMenu = false,
  side,
  variant = "secondary",
  align = "end",
  sideOffset = 16,
}: {
  className?: string;
  showLabel?: boolean;
  accountMenu?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  align?: "start" | "center" | "end";
  sideOffset?: number;
}) {
  const { push, refresh } = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress;
  const displayName = getUserDisplayName({
    fullName: user?.fullName,
    metadata: user?.unsafeMetadata,
    username: user?.username,
    email,
  });

  const initials = getInitials(displayName);

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
          variant={variant}
          className={cn(
            "rounded-sm flex size-[31px] items-center justify-center  p-0 outline-hidden ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            variant !== "ghost" &&
              "rounded-sm bg-background hover:bg-muted",
            showLabel && "h-9 w-full justify-start gap-2 px-2",
            className,
          )}
          aria-label="Open user menu"
          title="Open user menu"
        >
          <span
            className={cn(
              "flex size-full items-center justify-center rounded-sm bg-muted/80 text-xs font-semibold uppercase text-card-foreground",
              showLabel && "size-6 shrink-0",
            )}
          >
            {initials}
          </span>
          {showLabel ? (
            <span className="truncate text-sm font-medium">{displayName}</span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        side={side ?? (accountMenu ? "right" : "bottom")}
        sideOffset={sideOffset}
        className={cn("mt-1.5 w-56 rounded-sm", accountMenu && "w-59")}
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
        <DropdownMenuSeparator className={cn(accountMenu && "my-0 mt-2")} />
        {/* {accountMenu ? (
          <>
            <div className="p-1">
              <DropdownMenuItem className="h-8 rounded-none" disabled>
                <BadgeCheck />
                Account
                <span className="ms-auto text-[10px] uppercase text-muted-foreground">
                  Soon
                </span>
              </DropdownMenuItem>
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
        ) : null} */}
        <DropdownMenuItem
          variant="destructive"
          className={cn(
            "rounded-sm focus:rounded-sm data-highlighted:rounded-sm",
            accountMenu && "m-1 mt-2 h-8",
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
      <span className="rounded-sm bg-muted/80 flex size-9 shrink-0 border-border border items-center justify-center  text-xs font-semibold uppercase text-card-foreground">
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
