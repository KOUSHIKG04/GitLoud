"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardGetStartedButton() {
  const router = useRouter();
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

    router.push("/dashboard");
  }

  return (
    <>
      <button
        type="button"
        onClick={openDashboard}
        disabled={!isLoaded}
        className="px-6 py-2.5 gap-4 group isolation-auto relative z-10 mt-2 flex items-center justify-center overflow-hidden border bg-gray-50 text-md text-gray-900 shadow-xs backdrop-blur-md before:absolute before:-left-full before:-z-10 before:aspect-square before:w-full before:bg-primary before:transition-all before:duration-700 hover:text-gray-900 before:hover:left-0 before:hover:w-full before:hover:scale-150 before:hover:duration-700 dark:border-border dark:bg-card dark:text-white dark:hover:text-white lg:font-semibold"
      >
        <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-gray-900/40 after:transition-all after:duration-300 group-hover:after:w-full dark:after:bg-white/40">
          GET STARTED
        </span>
        <svg
          className="rounded-[50%] h-8 w-8 rotate-45 border bg-gray-50 border-gray-200 p-2 text-gray-50 duration-300 ease-linear group-hover:rotate-90 group-hover:border-gray-300 group-hover:bg-gray-50"
          viewBox="0 0 16 19"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M7 18C7 18.5523 7.44772 19 8 19C8.55228 19 9 18.5523 9 18H7ZM8.70711 0.292893C8.31658 -0.0976311 7.68342 -0.0976311 7.29289 0.292893L0.928932 6.65685C0.538408 7.04738 0.538408 7.68054 0.928932 8.07107C1.31946 8.46159 1.95262 8.46159 2.34315 8.07107L8 2.41421L13.6569 8.07107C14.0474 8.46159 14.6805 8.46159 15.0711 8.07107C15.4616 7.68054 15.4616 7.04738 15.0711 6.65685L8.70711 0.292893ZM9 18L9 1H7L7 18H9Z"
            className="fill-gray-800"
          />
        </svg>
      </button>

      <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
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
              <Link href="/sign-in">SIGN IN</Link>
            </Button>

            <Button asChild>
              <Link href="/sign-up">SIGN UP</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
