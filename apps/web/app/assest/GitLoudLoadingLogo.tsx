import { AppLogo } from "@/assest/AppLogo";

export function GitLoudLoadingLogo({
  size = 96,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <AppLogo
      width={size}
      height={size}
      title="GitLoud loading"
      className={className}
    />
  );
}
