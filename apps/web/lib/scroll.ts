export function scrollToTop() {
  if (typeof window === "undefined") return;
  const appScrollViewport = document.querySelector<HTMLElement>(
    "#app-scroll-area [data-main-viewport]"
  );
  appScrollViewport?.scrollTo({ top: 0, behavior: "smooth" });
}
