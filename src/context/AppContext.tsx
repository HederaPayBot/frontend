'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePrivy, User as PrivyUser } from '@privy-io/react-auth';
import { userAPI, paymentAPI, TokenBalance, Transaction as ApiTransaction, UserProfile } from '@/utils/api';
import { toast } from 'sonner';

// Define types
export type User = {
  id: string;
  twitterId?: string;
  twitterUsername?: string;
  hederaAccountId?: string;
  keyType?: string;
  privateKey?: string;
  networkType?: string;
  balances?: TokenBalance[];
  registeredAt?: string;
};

export type Transaction = ApiTransaction;

interface AppContextType {
  user: User | null;
  isRegistered: boolean;
  isLoading: boolean;
  isLinked: boolean;
  error: string | null;
  transactions: Transaction[];
  registerUser: (twitterUsername: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  refreshTokenBalances: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  checkLinkStatus: (twitterUsername: string) => Promise<boolean>;
  linkHederaAccount: (accountId: string, privateKey: string, networkType: string, keyType: string) => Promise<void>;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user: privyUser, authenticated, ready } = usePrivy();
  
  const [user, setUser] = useState<User | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLinked, setIsLinked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Check if user exists when they authenticate
  useEffect(() => {
    if (!ready) return;
    
    if (!authenticated || !privyUser) {
      setUser(null);
      setIsRegistered(false);
      setIsLoading(false);
      return;
    }

    console.log('Authenticated:', authenticated);
    console.log('Privy user:', privyUser);

    const checkRegistration = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Extract Twitter data from Privy
        const twitterAccount = privyUser.linkedAccounts.find(
          account => account.type === 'twitter_oauth'
        ) as any; // Type assertion to handle the Twitter account structure
        
        const twitterUsername = twitterAccount?.username || undefined;

        console.log('Twitter username:', twitterUsername);


        // Set basic user data from Privy
        setUser({
          id: privyUser.id,
          twitterUsername,
        });

        // Check if user exists in our backend
        const userExists = await userAPI.checkUserExists(twitterUsername);
        
        if (userExists.exists) {
          setIsRegistered(true);
          await refreshProfile();
          await refreshTransactions();
          await refreshBalances();
        } else {
          setIsRegistered(false);
        }
      } catch (error) {
        console.error('Error checking user registration:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while checking registration.');
      } finally {
        setIsLoading(false);
      }
    };

    checkRegistration();
  }, [authenticated, privyUser, ready]);

  // Check if user has linked Hedera account
  useEffect(() => {
    const checkUserLinkStatus = async () => {
      if (user?.twitterUsername) {
        console.log('Checking link status for user:', user.twitterUsername);
        try {
          const linked = await checkLinkStatus(user.twitterUsername);
          setIsLinked(linked);
        } catch (error) {
          console.error('Error checking link status:', error);
          setIsLinked(false);
        }
      } else {
        setIsLinked(false);
      }
    };

    if (user) {
      checkUserLinkStatus();
    }
  }, [user?.hederaAccountId, user?.twitterUsername]);

  const registerUser = async (twitterUsername: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userAPI.register(twitterUsername);
      if (response.success) {
        setIsRegistered(true);
        toast.success('Registration successful!');
        
        // Refresh user data after registration
        await refreshProfile();
        await refreshTransactions();
        await refreshBalances();
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
      toast.error('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    console.log('Refreshing profile');
    if ( !user?.twitterUsername) return;
    
    try {
      const profile = await userAPI.getProfile(user.twitterUsername);
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          ...mapProfileToUser(profile.user, prevUser.id),
        };
      });

      console.log('Profile:', profile);
      console.log('User:', user);

      
      // Check if user has a linked Hedera account
      const hasLinkedAccount = profile.user.hederaAccounts?.some(account => account.accountId);
      setIsLinked(!!hasLinkedAccount);
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Not setting the error state here to avoid showing errors on refresh
    }
  };

  // Alias for refreshProfile
  const refreshUserProfile = refreshProfile;

  // Helper function to map UserProfile to User
  const mapProfileToUser = (profile: UserProfile, id: string): User => {
    const primaryAccount = profile.hederaAccounts?.find(account => account.isPrimary);
    
    return {
      id,
      twitterId: profile.twitterId,
      twitterUsername: profile.twitterUsername,
      hederaAccountId: primaryAccount?.accountId,
      // Using optional chaining to handle potentially undefined properties
      keyType: (primaryAccount as any)?.keyType,
      networkType: (primaryAccount as any)?.networkType,
      registeredAt: profile.registeredAt || new Date().toISOString(),
    };
  };

  const refreshTransactions = async () => {
    if (!user?.id || !user.twitterUsername) return;
    
    try {
      // Only fetch if we're not already fetching transactions
      if (isLoading) return;
      
      // Don't set global loading state here to avoid full page refresh
      // Instead, components should handle their own loading states
      const transactionsData = await userAPI.getTransactionHistory(user.twitterUsername);
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    }
  };

  const refreshBalances = async () => {
    if (!user?.id || !user.twitterUsername) return;
    
    try {
      const balancesData = await userAPI.getTokenBalances(user.twitterUsername);
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          balances: balancesData.balances,
        };
      });
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  // Alias for refreshBalances
  const refreshTokenBalances = refreshBalances;

  const checkLinkStatus = async (twitterUsername: string): Promise<boolean> => {
    try {
      const profile = await userAPI.getProfile(twitterUsername);
      const hasLinkedAccount = profile.user.hederaAccounts?.some(account => account.accountId);
      return !!hasLinkedAccount;
    } catch (error) {
      console.error('Error checking link status:', error);
      return false;
    }
  };

  const linkHederaAccount = async (accountId: string, privateKey: string, networkType: string, keyType: string): Promise<void> => {
    if (!user?.twitterUsername) {
      throw new Error('User not authenticated');
    }

    try {
      const response = await userAPI.linkHederaAccount(
        user.twitterUsername,
        accountId,
        privateKey,
        networkType,
        keyType
      );

      if (response.success) {
        await refreshProfile();
        toast.success('Hedera account linked successfully!');
      } else {
        throw new Error(response.message || 'Failed to link Hedera account');
      }
    } catch (error) {
      console.error('Link account error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to link Hedera account. Please try again.');
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isRegistered,
        isLoading,
        isLinked,
        error,
        transactions,
        registerUser,
        refreshProfile,
        refreshTransactions,
        refreshBalances,
        refreshTokenBalances,
        refreshUserProfile,
        checkLinkStatus,
        linkHederaAccount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Hook for using the context
export const useApp = () => {
  const context = useContext(AppContext);
  
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};

export default AppContext; 