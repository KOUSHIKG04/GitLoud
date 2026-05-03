"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";

type AuthRequiredDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectUrl?: string;
};

export function AuthRequiredDialog({
  open,
  onOpenChange,
  redirectUrl,
}: AuthRequiredDialogProps) {
  const signInHref = buildAuthHref("/sign-in", redirectUrl);
  const signUpHref = buildAuthHref("/sign-up", redirectUrl);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none">
        <DialogHeader className="my-3">
          <DialogTitle className="text-[16px]">
            Please log in to continue
          </DialogTitle>
          <DialogDescription>
            Sign in or create an account to generate and save GitHub content.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="outline">
            <Link href={signInHref}>SIGN IN</Link>
          </Button>

          <Button asChild>
            <Link href={signUpHref}>SIGN UP</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function buildAuthHref(basePath: string, redirectUrl?: string) {
  if (!redirectUrl) {
    return basePath;
  }

  return `${basePath}?redirect_url=${encodeURIComponent(redirectUrl)}`;
}
