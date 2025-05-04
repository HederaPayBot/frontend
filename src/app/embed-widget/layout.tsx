import { Metadata } from 'next';

// Dynamic metadata generation based on URL parameters
export async function generateMetadata({ searchParams }: {
  searchParams?: { [key: string]: string | string[] | undefined }
} = {}): Promise<Metadata> {
  // Extract twitter_username from search params, defaulting to chain_oracle
  const username = searchParams && 
    typeof searchParams.twitter_username === 'string' 
      ? searchParams.twitter_username 
      : 'chain_oracle';
  
  // Create personalized metadata
  return {
    title: username !== 'chain_oracle' ? `HederaPayBot for @${username}` : 'HederaPayBot Payment Widget',
    description: username !== 'chain_oracle' 
      ? `Send Hedera payments directly to @${username}` 
      : 'Send Hedera payments directly with Twitter integration',
    openGraph: {
      title: username !== 'chain_oracle' 
        ? `HederaPayBot for @${username}` 
        : 'HederaPayBot Payment Widget',
      description: username !== 'chain_oracle' 
        ? `Send HBAR payments easily to @${username}` 
        : 'Send HBAR payments easily via Twitter',
      images: [username !== 'chain_oracle' 
        ? `https://hederapaybot.netlify.app/api/og/widget?twitter_username=${username}`
        : 'https://hederapaybot.netlify.app/api/og/widget'],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@HederaPayBot',
      title: username !== 'chain_oracle' 
        ? `HederaPayBot for @${username}` 
        : 'HederaPayBot Payment Widget',
      description: username !== 'chain_oracle' 
        ? `Send HBAR payments easily to @${username}` 
        : 'Send HBAR payments easily via Twitter',
      images: [username !== 'chain_oracle' 
        ? `https://hederapaybot.netlify.app/api/og/widget?twitter_username=${username}`
        : 'https://hederapaybot.netlify.app/api/og/widget'],
    },
  };
}

export default function EmbedWidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
