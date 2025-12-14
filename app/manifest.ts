import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Slurp",
    short_name: "Slurp",
    description: "Track shots per user in a session.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#facc15",
    icons: [
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
