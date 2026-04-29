"use client";

import { Button } from "@/components/ui/button";

export function ScrollToGeneratorButton() {
  function scrollToGenerator() {
    document.getElementById("generator")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <Button
      type="button"
      size="lg"
      className="w-full sm:w-auto"
      onClick={scrollToGenerator}
    >
      Get started
    </Button>
  );
}
