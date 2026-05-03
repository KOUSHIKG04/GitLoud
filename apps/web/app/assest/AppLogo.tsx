import { cn } from "@/lib/utils";

type AppLogoProps = {
  className?: string;
  title?: string;
};

export function AppLogo({ className, title = "GitLoud" }: AppLogoProps) {
  return (
    <svg
      aria-label={title}
      className={cn("shrink-0", className)}
      role="img"
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="48"
        y1="6"
        x2="48"
        y2="90"
        stroke="var(--gitloud-logo-accent)"
        strokeLinecap="round"
        strokeWidth="2.8"
      />
      <path
        d="M60 30 Q72 37.5 72 48 Q72 58.5 60 66"
        fill="none"
        stroke="var(--gitloud-logo-accent)"
        strokeLinecap="round"
        strokeWidth="2.8"
      />
      <path
        d="M36 30 Q24 37.5 24 48 Q24 58.5 36 66"
        fill="none"
        stroke="var(--gitloud-logo-accent)"
        strokeLinecap="round"
        strokeWidth="2.8"
      />
      <path
        d="M70 20 Q88 30 88 48 Q88 66 70 76"
        fill="none"
        opacity="0.45"
        stroke="var(--gitloud-logo-accent)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M26 20 Q8 30 8 48 Q8 66 26 76"
        fill="none"
        opacity="0.45"
        stroke="var(--gitloud-logo-accent)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="48" cy="48" r="14" fill="var(--gitloud-logo-accent)" />
      <circle cx="48" cy="48" r="6" className="fill-background" />
    </svg>
  );
}
