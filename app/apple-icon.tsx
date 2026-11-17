import { ImageResponse } from "next/og";

// Home-screen icon for iPhone/iPad (Safari doesn't use SVG favicons there). Same mark as app/icon.svg.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0d1219" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path d="M15 19 L30 32 L15 45" fill="none" stroke="#4ade80" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="34" y="40" width="17" height="6.5" rx="2" fill="#22d3ee" />
        </svg>
      </div>
    ),
    size,
  );
}
