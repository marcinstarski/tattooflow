import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TaFlo CRM",
    short_name: "TaFlo",
    description: "CRM dla studiów tatuażu: leady, kalendarz, zadatki i automatyzacje.",
    start_url: "/app",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    lang: "pl",
    icons: [
      {
        src: "/icon1.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
