"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClerk, useUser } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function UserProfileMenu() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { user } = useUser();

  const email = user?.primaryEmailAddress?.emailAddress;
  const displayName = getDisplayName(user?.fullName, email);
  const initials = getInitials(displayName);

  async function handleLogout() {
    const toastId = toast.loading("Logging out...");

    try {
      await signOut();
      toast.success("Logged out", { id: toastId });
      router.push("/");
      router.refresh();
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
        <button
          type="button"
          className="flex size-[31px] items-center justify-center border border-border bg-background p-0 rounded-none outline-none ring-offset-background transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open user menu"
          title="Open user menu"
        >
          <span className="flex size-full items-center justify-center bg-card text-xs font-semibold uppercase text-card-foreground">
            {initials}
          </span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="center" className="w-56 rounded-none mt-1.5">
        <DropdownMenuLabel className="truncate">
          {displayName}
        </DropdownMenuLabel>
        {email ? (
          <DropdownMenuLabel className="truncate pt-0 text-[11px] font-normal">
            {email}
          </DropdownMenuLabel>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          className="rounded-none focus:rounded-none data-highlighted:rounded-none"
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

function getDisplayName(
  fullName: string | null | undefined,
  email: string | undefined,
) {
  const trimmedName = fullName?.trim();

  if (trimmedName && trimmedName !== email) {
    return trimmedName;
  }

  const emailName = email?.split("@")[0]?.trim();

  return emailName || "User";
}
