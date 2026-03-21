export default function manifest() {
  return {
    name: "RiverLub",
    short_name: "RiverLub",
    description: "Sistema inteligente para oficinas mecânicas",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#111111",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}