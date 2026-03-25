import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "RiverLub",
    template: "%s | RiverLub",
  },
  description: "Sistema inteligente para oficinas mecânicas",
  applicationName: "RiverLub",
  keywords: [
    "oficina mecânica",
    "ordem de serviço",
    "gestão de oficina",
    "catálogo de peças",
    "diagnóstico automotivo",
    "RiverLub",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RiverLub",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport = {
  themeColor: "#10233f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} rl-body`}>
        {children}
      </body>
    </html>
  );
}