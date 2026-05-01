"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export function AuthToast() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const auth = searchParams.get("auth");
  const authError = searchParams.get("auth_error");

  useEffect(() => {
    if (auth === "sign-in") {
      toast.success("Signed In Successfully!");
    }

    if (auth === "sign-up") {
      toast.success("Account created!!");
    }

    if (authError) {
      toast.error(authError, { duration: 7000 });
    }

    if (auth || authError) {
      router.replace("/");
    }
  }, [auth, authError, router]);

  return null;
}
