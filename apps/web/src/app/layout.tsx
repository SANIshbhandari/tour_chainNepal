import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Tour Chain Nepal | Solana-Powered Tourism",
  description: "Trustless bookings, verifiable experiences, and on-chain reputation for Nepal's tourism ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-dm-sans bg-summit-white">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
