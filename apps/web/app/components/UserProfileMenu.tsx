"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
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

  const displayName =
    user?.fullName ??
    user?.primaryEmailAddress?.emailAddress ??
    "User";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex size-[30px] items-center justify-center border border-border bg-background p-0 rounded-none outline-none ring-offset-background transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open user menu"
          title="Open user menu"
        >
          <Avatar className="size-[30px] rounded-none after:rounded-none after:border-0">
            <AvatarImage
              src={user?.imageUrl}
              alt={displayName}
              className="rounded-none"
            />
            <AvatarFallback className="rounded-none">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-none mt-1.5">
        <DropdownMenuLabel className="truncate">
          {displayName}
        </DropdownMenuLabel>
        {user?.primaryEmailAddress?.emailAddress ? (
          <DropdownMenuLabel className="truncate pt-0 text-[11px] font-normal">
            {user.primaryEmailAddress.emailAddress}
          </DropdownMenuLabel>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            event.preventDefault();
            void handleLogout();
          }}
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function getInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}
