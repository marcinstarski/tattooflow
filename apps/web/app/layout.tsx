import "./globals.css";
import type { Metadata } from "next";
import { DM_Sans, Archivo_Black } from "next/font/google";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const archivo = Archivo_Black({ subsets: ["latin"], weight: "400", variable: "--font-display" });

export const metadata: Metadata = {
  title: "Taflo CRM – CRM dla tatuatorów",
  description: "CRM dla studiów tatuażu: leady, kalendarz, zadatki, automatyzacje i marketing.",
  metadataBase: new URL("https://example.com"),
  openGraph: {
    title: "Taflo CRM",
    description: "SaaS CRM dla tatuatorów.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={`${dmSans.variable} ${archivo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
