import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PrivyProvider } from "@/providers/PrivyProvider";
import { AppProvider } from "@/context/AppContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hedera Twitter Pay",
  description: "Send payments on Hedera via Twitter commands",
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hederapaybot.netlify.app',
    siteName: 'HederaPayBot',
    images: ['/api/og'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HederaPayBot',
    images: ['/api/og'],
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
