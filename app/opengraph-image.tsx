import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} · ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#070a0f",
          color: "#e6edf3",
          fontFamily: "monospace",
        }}
      >
        <div style={{ fontSize: 28, color: "#8b98a9", display: "flex" }}>
          <span style={{ color: "#4ade80" }}>{site.handle}</span>@portfolio ~ $ whoami
        </div>
        <div style={{ fontSize: 88, fontWeight: 700, marginTop: 24 }}>{site.name}</div>
        <div style={{ fontSize: 44, color: "#4ade80", marginTop: 8 }}>{site.role}</div>
        <div style={{ fontSize: 28, color: "#8b98a9", marginTop: 40 }}>Ask my AI anything about my work →</div>
      </div>
    ),
    size,
  );
}
