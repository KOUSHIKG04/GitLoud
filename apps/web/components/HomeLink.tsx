"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { scrollToTop } from "@/lib/scroll";

type HomeLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href">;

export function HomeLink({ onClick, ...props }: HomeLinkProps) {
  return (
    <Link
      {...props}
      href="/"
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || window.location.pathname !== "/") {
          return;
        }

        event.preventDefault();
        scrollToTop();
      }}
    />
  );
}
