'use client';

import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { ReactNode } from 'react';

interface PrivyProviderProps {
  children: ReactNode;
}

export function PrivyProvider({ children }: PrivyProviderProps) {
  // Privy app ID from environment variables
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    console.error('NEXT_PUBLIC_PRIVY_APP_ID is not defined in your environment variables');
    return <div>Error: Privy App ID not configured.</div>;
  }

  return (
    <PrivyProviderBase
      appId={appId}
      config={{
        // Configure appearance
        appearance: {
          theme: 'light',
          accentColor: '#8247E5', // Hedera purple
          logo: '/logo.png',
        },
        // Configure login methods
        loginMethods: ['twitter'],
        // Required scopes for Twitter auth
        embeddedWallets: {
          createOnLogin: 'all-users'
        }
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}

export default PrivyProvider; 