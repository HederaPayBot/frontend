'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { usePrivy, User as PrivyUser } from '@privy-io/react-auth';
import { userAPI, paymentAPI, TokenBalance, Transaction as ApiTransaction, UserProfile, hederaUtils } from '@/utils/api';
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
  hbarBalance?: string;
  registeredAt?: string;
};

export type Transaction = ApiTransaction;

interface AppContextType {
  user: User | null;
  isRegistered: boolean;
  isLoading: boolean;
  isLinked: boolean;
  isBalanceLoading: boolean;
  error: string | null;
  transactions: Transaction[];
  registerUser: (twitterUsername: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshBalances: () => Promise<void>;
  refreshHbarBalance: () => Promise<void>;
  refreshTokenBalances: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  checkLinkStatus: (twitterUsername: string) => Promise<boolean>;
  linkHederaAccount: (accountId: string, privateKey: string, networkType: string, keyType: string) => Promise<void>;
  // Helper methods for formatted values
  getFormattedHbarBalance: () => string;
  getEstimatedHbarUsdValue: (customPrice?: number) => number;
  getHashscanAccountUrl: () => string | null;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { user: privyUser, authenticated, ready } = usePrivy();
  
  const [user, setUser] = useState<User | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBalanceLoading, setIsBalanceLoading] = useState<boolean>(false);
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
          // Load balance, transactions, and token data in parallel
          await Promise.all([
            refreshHbarBalance(),
            refreshTransactions(),
            refreshTokenBalances()
          ]);
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
        await Promise.all([
          refreshHbarBalance(),
          refreshTransactions(),
          refreshTokenBalances()
        ]);
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
    if (!user?.twitterUsername) return;
    
    try {
      const profile = await userAPI.getProfile(user.twitterUsername);
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          ...mapProfileToUser(profile.user, prevUser.id),
          // Preserve HBAR balance if it exists
          hbarBalance: prevUser.hbarBalance 
        };
      });

      // Check if user has a linked Hedera account
      const hasLinkedAccount = profile.user.hederaAccounts?.some(account => account.accountId);
      setIsLinked(!!hasLinkedAccount);
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Not setting the error state here to avoid showing errors on refresh
    }
  };

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

  const refreshHbarBalance = async () => {
    if (!user?.id || !user.twitterUsername) return;
    
    try {
      setIsBalanceLoading(true);
      const balanceData = await userAPI.getHbarBalance(user.twitterUsername);
      
      if (balanceData.success) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            hbarBalance: balanceData.hbarBalance,
          };
        });
      }
    } catch (error) {
      console.error('Error refreshing HBAR balance:', error);
    } finally {
      setIsBalanceLoading(false);
    }
  };

  const refreshBalances = async () => {
    if (!user?.id || !user.twitterUsername) return;
    
    try {
      // Refresh both HBAR and token balances
      await Promise.all([
        refreshHbarBalance(),
        refreshTokenBalances()
      ]);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    }
  };

  const refreshTokenBalances = async () => {
    if (!user?.id || !user.twitterUsername) return;
    
    try {
      const tokensData = await userAPI.getAllTokens(user.twitterUsername);
      
      if (tokensData.success) {
        // Convert to TokenBalance format
        const balances: TokenBalance[] = tokensData.tokens.map(token => ({
          tokenId: token.tokenId,
          tokenName: token.name,
          tokenSymbol: token.symbol,
          balance: token.balance,
          type: 'FUNGIBLE_COMMON',
          decimals: token.decimals
        }));
        
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            balances,
          };
        });
      }
    } catch (error) {
      console.error('Error refreshing token balances:', error);
    }
  };

  // Alias for refreshProfile for consistent naming
  const refreshUserProfile = refreshProfile;

  const checkLinkStatus = async (twitterUsername: string): Promise<boolean> => {
    try {
      const linkStatus = await userAPI.getLinkStatus(twitterUsername);
      return linkStatus.linked;
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
        // Load balance data after linking account
        await Promise.all([
          refreshHbarBalance(),
          refreshTokenBalances()
        ]);
        toast.success('Hedera account linked successfully!');
      } else {
        throw new Error(response.message || 'Failed to link Hedera account');
      }
    } catch (error) {
      console.error('Link account error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to link Hedera account. Please try again.');
    }
  };

  // ========== Helper methods for formatted values ==========
  
  /**
   * Get formatted HBAR balance with proper decimal places
   */
  const getFormattedHbarBalance = (): string => {
    if (!user?.hbarBalance) return '0.00';
    return hederaUtils.formatHbarBalance(user.hbarBalance);
  };
  
  /**
   * Get estimated USD value of the user's HBAR balance
   */
  const getEstimatedHbarUsdValue = (customPrice?: number): number => {
    if (!user?.hbarBalance) return 0;
    return hederaUtils.estimateHbarToUsd(user.hbarBalance, customPrice);
  };
  
  /**
   * Get HashScan URL for the user's account
   */
  const getHashscanAccountUrl = (): string | null => {
    if (!user?.hederaAccountId) return null;
    return hederaUtils.getHashscanAccountUrl(
      user.hederaAccountId, 
      user.networkType || 'testnet'
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isRegistered,
        isLoading,
        isLinked,
        isBalanceLoading,
        error,
        transactions,
        registerUser,
        refreshProfile,
        refreshTransactions,
        refreshBalances,
        refreshHbarBalance,
        refreshTokenBalances,
        refreshUserProfile,
        checkLinkStatus,
        linkHederaAccount,
        // Helper methods
        getFormattedHbarBalance,
        getEstimatedHbarUsdValue,
        getHashscanAccountUrl
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