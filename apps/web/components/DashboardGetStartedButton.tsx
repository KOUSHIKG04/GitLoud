"use client";

import { AuthRequiredDialog } from "@/components/auth/AuthRequiredDialog";
import { useUser } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardGetStartedButton() {
  const { push } = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  function openDashboard() {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setLoginDialogOpen(true);
      return;
    }

    push("/dashboard");
  }

  return (
    <>
      <Button
        type="button"
        onClick={openDashboard}
        disabled={!isLoaded}
        className=" active:scale-98 font-semibold tracking-wider"
        variant="default"
      >
        GET STARTED
      </Button>

      <AuthRequiredDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
    </>
  );
}
