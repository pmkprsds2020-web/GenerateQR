import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { SupabaseSync } from "@/components/qr/supabase-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://qr-gen-pro.app"),
  title: {
    default: "QR GEN PRO — QR Code Generator Gratis",
    template: "%s — QR GEN PRO",
  },
  description:
    "Buat QR Code dengan cepat untuk website, WhatsApp, WiFi, email, kontak, lokasi, dan berbagai kebutuhan lainnya. Download PNG, JPG, SVG, PDF.",
  keywords: [
    "QR Code",
    "QR Generator",
    "QR Code Generator",
    "WhatsApp QR",
    "WiFi QR",
    "vCard QR",
    "QR Scanner",
    "QR GEN PRO",
  ],
  authors: [{ name: "QR GEN PRO" }],
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "QR GEN PRO — QR Code Generator Gratis",
    description:
      "Buat QR Code dengan cepat untuk website, WhatsApp, WiFi, email, kontak, lokasi, dan berbagai kebutuhan lainnya.",
    siteName: "QR GEN PRO",
    type: "website",
    locale: "id_ID",
    images: [{ url: "/logo-new.png", width: 1024, height: 1024, alt: "QR GEN PRO Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR GEN PRO — QR Code Generator Gratis",
    description: "Buat QR Code dengan cepat untuk berbagai kebutuhan.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange={false}>
          <SupabaseSync />
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
