"use client";

import { AuthRequiredDialog } from "@/components/auth/AuthRequiredDialog";
import { useUser } from "@clerk/nextjs";
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
      <button
        type="button"
        onClick={openDashboard}
        disabled={!isLoaded}
        className="px-6 py-2.5 gap-4 group isolation-auto relative z-10 mt-2 flex items-center justify-center overflow-hidden border bg-neutral-50 text-md text-neutral-900 shadow-xs backdrop-blur-md before:absolute before:-left-full before:-z-10 before:aspect-square before:w-full before:bg-primary before:transition-all before:duration-700 hover:text-neutral-900 before:hover:left-0 before:hover:w-full before:hover:scale-150 before:hover:duration-700 dark:border-border dark:bg-card dark:text-white dark:hover:text-white lg:font-semibold"
      >
        <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-neutral-900/40 after:transition-all after:duration-300 group-hover:after:w-full dark:after:bg-white/40">
          GET STARTED
        </span>
        <svg
          className="size-8 rounded-[50%] rotate-45 border bg-neutral-50 border-neutral-200 p-2 text-neutral-50 duration-300 ease-linear group-hover:rotate-90 group-hover:border-neutral-300 group-hover:bg-neutral-50"
          viewBox="0 0 16 19"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M7 18c0 .55.45 1 1 1s1-.45 1-1H7ZM8.71.29a1 1 0 0 0-1.42 0L.93 6.66a1 1 0 1 0 1.41 1.41L8 2.41l5.66 5.66a1 1 0 1 0 1.41-1.41L8.71.29ZM9 18V1H7v17h2Z"
            className="fill-neutral-800"
          />
        </svg>
      </button>

      <AuthRequiredDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
      />
    </>
  );
}
