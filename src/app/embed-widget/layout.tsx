import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HederaPayBot Payment Widget',
  description: 'Send Hedera payments directly with Twitter integration',
  openGraph: {
    title: 'HederaPayBot Payment Widget',
    description: 'Send HBAR payments easily via Twitter',
    images: ['/api/og/widget'],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@HederaPayBot',
    title: 'HederaPayBot Payment Widget',
    description: 'Send HBAR payments easily via Twitter',
    images: ['/api/og/widget'],
  },
};

export default function EmbedWidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
