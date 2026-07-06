export function scrollToTop() {
  if (typeof window === "undefined") return;
  const appScrollViewport = document.querySelector<HTMLElement>(
    "#app-scroll-area [data-main-viewport]"
  );
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  appScrollViewport?.scrollTo({
    top: 0,
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}
