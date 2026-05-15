import { ImageResponse } from "next/og";

export const alt = "GitLoud - GitHub PR Summary and Social Post Generator";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const rootStyle = {
  alignItems: "center",
  background: "#09090b",
  color: "#fafafa",
  display: "flex",
  fontFamily: "monospace",
  height: "100%",
  justifyContent: "center",
  padding: 72,
  width: "100%",
} as const;
const panelStyle = {
  border: "2px solid #3f3f46",
  display: "flex",
  flexDirection: "column",
  gap: 24,
  padding: 56,
  width: "100%",
} as const;
const eyebrowStyle = { color: "#facc15", fontSize: 28, fontWeight: 700 } as const;
const titleStyle = { fontSize: 72, fontWeight: 800, lineHeight: 1.05 } as const;
const bodyStyle = { color: "#d4d4d8", fontSize: 30, lineHeight: 1.35 } as const;

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={rootStyle}>
        <div style={panelStyle}>
          <div style={eyebrowStyle}>
            GITLOUD
          </div>
          <div style={titleStyle}>
            Turn GitHub PRs into share-ready content.
          </div>
          <div style={bodyStyle}>
            PR summaries, commit summaries, changelog entries, portfolio
            bullets, and developer social posts.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
