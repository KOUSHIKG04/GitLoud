"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";

type HomeLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href">;

export function HomeLink({ onClick, ...props }: HomeLinkProps) {
  const pathname = usePathname();

  return (
    <Link
      {...props}
      href="/"
      onClick={(event) => {
        onClick?.(event);

        if (event.defaultPrevented || pathname !== "/") {
          return;
        }

        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    />
  );
}
