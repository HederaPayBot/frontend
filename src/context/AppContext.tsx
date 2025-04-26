'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { userAPI, paymentAPI } from '@/utils/api';

// Define types
interface User {
  id: string;
  twitterUsername: string;
  twitterId: string;
  hederaAccountId?: string;
  registeredAt?: string;
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
  refreshUserProfile: () => Promise<void>;
  checkLinkStatus: (username: string) => Promise<boolean>;
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
            id: response.data.twitterId,
            twitterId: response.data.twitterId,
            twitterUsername: response.data.twitterUsername,
            hederaAccountId: response.data.hederaAccountId,
            registeredAt: response.data.registeredAt
          });
          
          // Load transactions for the user
          if (response.data.twitterUsername) {
            try {
              await refreshTransactions();
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

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await userAPI.getProfile(user.twitterUsername);
      
      setUser({
        ...user,
        hederaAccountId: response.user.hederaAccounts?.[0]?.accountId,
        registeredAt: response.user.registeredAt
      });
      
      setError(null);
    } catch (error: any) {
      setError(error.message || 'Failed to refresh user profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if a Twitter user has linked their Hedera account
  const checkLinkStatus = async (username: string) => {
    try {
      const response = await userAPI.getLinkStatus(username);
      return response.linked;
    } catch (error: any) {
      console.error('Failed to check link status:', error);
      return false;
    }
  };

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
        refreshUserProfile,
        checkLinkStatus
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