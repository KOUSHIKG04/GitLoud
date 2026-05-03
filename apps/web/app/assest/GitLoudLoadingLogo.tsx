export function GitLoudLoadingLogo({
  size = 96,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="GitLoud loading"
      className={className}
    >
      <g className="gitloud-loading-mark">
        <line
          x1="48"
          y1="6"
          x2="48"
          y2="90"
          stroke="var(--gitloud-logo-accent)"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="gitloud-loading-stem"
        />

        <path
          d="M60 30 Q72 37.5 72 48 Q72 58.5 60 66"
          fill="none"
          stroke="var(--gitloud-logo-accent)"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="gitloud-loading-wave gitloud-loading-wave-inner"
        />

        <path
          d="M36 30 Q24 37.5 24 48 Q24 58.5 36 66"
          fill="none"
          stroke="var(--gitloud-logo-accent)"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="gitloud-loading-wave gitloud-loading-wave-inner"
        />

        <path
          d="M70 20 Q88 30 88 48 Q88 66 70 76"
          fill="none"
          stroke="var(--gitloud-logo-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
          className="gitloud-loading-wave gitloud-loading-wave-outer"
        />

        <path
          d="M26 20 Q8 30 8 48 Q8 66 26 76"
          fill="none"
          stroke="var(--gitloud-logo-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.45"
          className="gitloud-loading-wave gitloud-loading-wave-outer"
        />

        <circle
          cx="48"
          cy="48"
          r="14"
          fill="var(--gitloud-logo-accent)"
          className="gitloud-loading-commit"
        />
        <circle
          cx="48"
          cy="48"
          r="6"
          className="gitloud-loading-commit-hole fill-background"
        />
      </g>
    </svg>
  );
}
