"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function AuthToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = searchParams.get("auth");
  const authError = searchParams.get("auth_error");
  const verified = searchParams.get("verified");
  const handledSignalRef = useRef<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const signal = [auth, authError, verified].filter(Boolean).join(":");

    if (!signal || handledSignalRef.current === signal) {
      return;
    }

    handledSignalRef.current = signal;

    if (auth === "sign-in") {
      toast.success("Signed In Successfully!", { id: "auth-sign-in" });
    }

    if (auth === "sign-up") {
      toast.success("Account created!!", { id: "auth-sign-up" });
    }

    if (authError) {
      toast.error(authError, { id: "auth-error", duration: 7000 });
    }

    if (verified === "1") {
      toast.success("Email verified. You can sign in now.", {
        id: "auth-verified",
        duration: 7000,
      });
    }

    router.replace(pathname);
  }, [auth, authError, router, verified, pathname]);

  return null;
}
