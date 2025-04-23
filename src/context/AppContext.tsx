'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { userAPI, paymentAPI } from '@/utils/api';

// Define types
interface User {
  id: string;
  twitterUsername: string;
  hederaAccountId?: string;
}

interface Transaction {
  id: string;
  sender: string;
  recipient: string;
  amount: number;
  tokenType: string;
  status: 'pending' | 'completed' | 'failed';
  hederaTransactionId?: string;
  timestamp: string;
}

interface AppContextType {
  user: User | null;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  linkHederaAccount: (hederaAccountId: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const { user: privyUser, authenticated, ready } = usePrivy();
  
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Register user in our backend when authenticated with Privy
  useEffect(() => {
    const registerUser = async () => {
      if (authenticated && privyUser) {
        try {
          setIsLoading(true);
          
          // Extract Twitter username and ID from Privy user
          let twitterUsername = '';
          let twitterId = '';
          
          // Get linked accounts from Privy user
          if (privyUser.linkedAccounts && Array.isArray(privyUser.linkedAccounts)) {
            // Find Twitter account safely by casting to any to avoid TypeScript errors
            // with the Privy API types, which may vary between versions
            const twitterAccount = (privyUser.linkedAccounts as any[]).find(
              account => account.type === 'twitter_oauth'
            );
            
            if (twitterAccount) {
              // Safely extract Twitter info
              twitterUsername = twitterAccount?.username || 
                               twitterAccount?.handle || 
                               twitterAccount?.metadata?.username || 
                               twitterAccount?.metadata?.handle || '';
              
              twitterId = twitterAccount?.id || 
                         twitterAccount?.subject || 
                         twitterAccount?.metadata?.id || '';
            }
          }
          
          if (!twitterUsername || !twitterId) {
            setError('Twitter information is not available. Please link your Twitter account.');
            setIsLoading(false);
            return;
          }
          
          // Register user in our backend
          const response = await userAPI.register(twitterId, twitterUsername);
          
          // Set user from response
          setUser({
            id: response.user.id,
            twitterUsername: response.user.twitterUsername,
            hederaAccountId: response.user.hederaAccountId,
          });
          
          // Load transactions for the user
          if (response.user.twitterUsername) {
            try {
              const txResponse = await paymentAPI.getPaymentHistory(response.user.twitterUsername);
              setTransactions(txResponse.transactions || []);
            } catch (err) {
              console.error('Failed to load transaction history:', err);
              // Don't fail the whole registration process if transaction loading fails
            }
          }
          
          setError(null);
        } catch (error: any) {
          setError(error.message || 'Failed to register user');
        } finally {
          setIsLoading(false);
        }
      } else if (ready && !authenticated) {
        setUser(null);
        setTransactions([]);
        setIsLoading(false);
      }
    };

    registerUser();
  }, [authenticated, privyUser, ready]);

  // Link Hedera account to user
  const linkHederaAccount = async (hederaAccountId: string) => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await userAPI.linkHederaAccount(user.twitterUsername, hederaAccountId);
      
      setUser({
        ...user,
        hederaAccountId: response.user.hederaAccountId,
      });
      
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to link Hedera account');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user transactions
  const refreshTransactions = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await paymentAPI.getPaymentHistory(user.twitterUsername);
      
      setTransactions(response.transactions || []);
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        transactions,
        isLoading,
        error,
        linkHederaAccount,
        refreshTransactions,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// Hook for using app context
export function useApp() {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
}

export default AppContext; 