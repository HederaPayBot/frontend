import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hedera Twitter & Telegram Pay - Smart Payments with simple commands",
  description: "A simple way to send crypto payments using Twitter mentions and Telegram messages. Just mention @HederaPayBot and type a command to transfer HBAR to anyone.",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hederapaybot.netlify.app',
    siteName: 'HederaPayBot',
    images: ['https://hederapaybot.netlify.app/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HederaPayBot',
    images: ['https://hederapaybot.netlify.app/api/og'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyProvider>
          <AppProvider>
            {children}
            <Toaster />
          </AppProvider>
        </PrivyProvider>
      </body>
    </html>
  );
}
