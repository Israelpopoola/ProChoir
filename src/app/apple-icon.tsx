import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#6d28d9" }}>
        <svg width="120" height="120" viewBox="0 0 64 64">
          <path d="M26 44V18l18-4v26" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="21" cy="44" r="5" fill="#fff" />
          <circle cx="39" cy="40" r="5" fill="#fff" />
        </svg>
      </div>
    ),
    size,
  );
}
