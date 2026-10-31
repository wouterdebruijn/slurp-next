import type { Metadata, Viewport } from "next";
import { Creepster, Geist, Geist_Mono, Nosifer } from "next/font/google";
import FlyingWitch from "./components/halloween/flying-witch";
import ZombieHorde from "./components/halloween/zombie-horde";
import SpookyBackdrop from "./components/halloween/spooky-backdrop";
import { QueryProvider } from "./providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const creepster = Creepster({
  variable: "--font-creepster",
  weight: "400",
  subsets: ["latin"],
});

const nosifer = Nosifer({
  variable: "--font-nosifer",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Slurp - Drink If You Dare 🎃",
  description: "Join the séance and drink with your fellow ghouls",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Slurp",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  colorScheme: "dark",
  themeColor: "#0b0612",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${creepster.variable} ${nosifer.variable} antialiased `}
      >
        <div className="relative min-h-screen bg-crypt">
          <SpookyBackdrop />
          <div id="page-content" className="relative z-10">
            <QueryProvider>{children}</QueryProvider>
          </div>
          <ZombieHorde />
          <FlyingWitch />
        </div>
      </body>
    </html>
  );
}
