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
      className="w-full sm:w-auto font-semibold rounded-[18px] px-5 rounded-none"
      onClick={scrollToGenerator}
    >
      GET STARTED
    </Button>
  );
}
