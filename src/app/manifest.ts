import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  const name = process.env.NEXT_PUBLIC_CHOIR_NAME || "Citadel Choir";
  return {
    name: `${name} · MFM Dallas Citadel of Testimonies`,
    short_name: name,
    description: "Set lists, lyrics and rehearsal audio for the choir.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f0d14",
    theme_color: "#6d28d9",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
