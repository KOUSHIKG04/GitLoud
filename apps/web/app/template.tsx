import { PageRevealOverlay } from "@/components/PageRevealOverlay";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageRevealOverlay />
      <div className="gitloud-page-enter">{children}</div>
    </>
  );
}
