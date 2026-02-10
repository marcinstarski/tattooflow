import "./globals.css";
import type { Metadata, Viewport } from "next";
import { DM_Sans, Archivo_Black } from "next/font/google";
import { RegisterServiceWorker } from "@/components/common/register-sw";
import { BootSplash } from "@/components/common/boot-splash";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  title: "TaFlo CRM – CRM dla tatuatorów",
  description: "CRM dla studiów tatuażu: leady, kalendarz, zadatki, automatyzacje i marketing.",
  metadataBase: new URL("https://taflo.app"),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "TaFlo",
    statusBarStyle: "black-translucent"
  },
  icons: {
    icon: "/tafloicon.png",
    apple: "/apple-icon.png"
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "TaFlo",
    "mobile-web-app-capable": "yes"
  },
  openGraph: {
    title: "TaFlo CRM",
    description: "SaaS CRM dla tatuatorów.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${dmSans.variable} ${archivo.variable}`}>
      <body>
        <RegisterServiceWorker />
        <BootSplash />
        <div id="app-root" className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
