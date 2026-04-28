import { ThemeToggle } from "@/components/ToggleThemeBtn";

export function Header() {
  return (
    <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-background border-b">
      <div className="text-lg font-bold tracking-tight">GitLoud</div>
      <ThemeToggle />
    </header>
  );
}
