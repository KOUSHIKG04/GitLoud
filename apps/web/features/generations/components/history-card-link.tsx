"use client";

import { useSidebar } from "@repo/ui/components/sidebar";
import { useRouter } from "next/navigation";
import type { ReactNode, MouseEvent } from "react";

interface HistoryCardLinkProps {
  href: string;
  children?: ReactNode;
  ariaLabel: string;
}

export function HistoryCardLink({
  href,
  children,
  ariaLabel,
}: HistoryCardLinkProps) {
  const { setOpen, setOpenMobile } = useSidebar();
  const router = useRouter();

  function navigateToDetails(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();

    // Close both desktop and mobile sidebars with standard animations
    setOpen(false);
    setOpenMobile(false);

    // Perform the router transition
    router.push(href);
  }

  return (
    <a
      href={href}
      onClick={navigateToDetails}
      className="absolute inset-0 z-10"
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
