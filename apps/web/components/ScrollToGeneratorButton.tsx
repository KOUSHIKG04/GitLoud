"use client";

import { Button } from "@repo/ui/components/button";

function scrollToGenerator() {
  document.getElementById("generator")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function ScrollToGeneratorButton() {
  return (
    <Button
      type="button"
      size="lg"
      className="w-full sm:w-auto font-semibold px-5 rounded-none"
      onClick={scrollToGenerator}
    >
      GET STARTED
    </Button>
  );
}
