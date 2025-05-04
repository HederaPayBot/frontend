/**
 * API utility for making requests to the backend
 */

// Base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_ELIZA_API_URL || 'http://localhost:5001';

/**
 * Type definitions based on API schema
 */
export interface User {
  twitterUsername: string;
  twitterId: string;
  hederaAccountId?: string;
  hederaPrivateKey?: string;
  hederaPublicKey?: string;
  hederaNetworkType?: string;
  hederaKeyType?: string;
}

export interface UserProfile {
  twitterUsername: string;
  twitterId: string;
  registeredAt?: string;
  hederaAccounts?: {
    accountId: string;
    isPrimary: boolean;
    linkedAt: string;
  }[];
}

export interface Transaction {
  id?: number | null;
  transactionId: string;
  type: string;
  amount: string;
  tokenId: string;
  timestamp: string;
  senderUsername: string;
  recipientUsername: string;
  status: string;
  memo?: string;
  networkType?: string;
  source?: string;
  hashscanUrl?: string;
}

export interface TokenBalance {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  balance: string;
  type: string;
  decimals: number;
}

export interface HbarBalanceResponse {
  success: boolean;
  accountId: string;
  hbarBalance: string;
  network: string;
}

export interface TokensResponse {
  success: boolean;
  tokens: {
    tokenId: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
    rawBalance: string;
  }[];
  totalTokens: number;
  accountId: string;
  network: string;
}

export interface TokenDetailResponse {
  success: boolean;
  token: {
    tokenId: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
    rawBalance: string;
    accountId: string;
    network: string;
  };
}

export interface ElizaMessage {
  text: string;
  userId: string;
  userName: string;
}

export interface HealthResponse {
  status: string;
  message: string;
  twitterIntegration: string;
  twitterPolling: string;
  pollingInterval: string;
  hederaClient: string;
  environment: string;
}

export interface LinkStatusResponse {
  success: boolean;
  linked: boolean;
  hederaAccount?: string;
}

export interface UserExistsResponse {
  exists: boolean;
  user?: UserProfile;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
}

export interface TransactionHistoryResponse {
  success: boolean;
  transactions: Transaction[];
}

export interface TransactionDetailsResponse {
  success: boolean;
  transaction: Transaction;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  message: string;
}

export interface ElizaStatusResponse {
  success: boolean;
  available: boolean;
  url: string;
  agent: string;
  details?: any;
}

export interface ElizaMessageResponse {
  success: boolean;
  response: string;
  action?: string;
  data?: any;
}

/**
 * Hedera-specific utility functions
 */
export const hederaUtils = {
  /**
   * Generates a HashScan URL for a transaction
   * @param transactionId The transaction ID
   * @param network The network type (testnet, mainnet)
   * @returns The HashScan URL
   */
  getHashscanTransactionUrl: (transactionId: string, network: string = 'testnet'): string => {
    return `https://hashscan.io/${network}/transaction/${transactionId}`;
  },
  
  /**
   * Generates a HashScan URL for an account
   * @param accountId The account ID
   * @param network The network type (testnet, mainnet)
   * @returns The HashScan URL
   */
  getHashscanAccountUrl: (accountId: string, network: string = 'testnet'): string => {
    return `https://hashscan.io/${network}/account/${accountId}`;
  },
  
  /**
   * Formats a token balance with the correct number of decimal places
   * @param balance The raw balance string
   * @param decimals The number of decimal places
   * @returns Formatted balance string
   */
  formatTokenBalance: (balance: string, decimals: number): string => {
    const value = parseFloat(balance);
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals > 8 ? 8 : decimals
    });
  },
  
  /**
   * Formats HBAR balance to a user-friendly format
   * @param hbarBalance The HBAR balance string
   * @returns Formatted HBAR balance
   */
  formatHbarBalance: (hbarBalance: string): string => {
    const value = parseFloat(hbarBalance);
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5
    });
  },
  
  /**
   * Estimate USD value of HBAR amount
   * @param hbarAmount HBAR amount as string or number
   * @param hbarPriceUSD Current HBAR price in USD (default: 0.07)
   * @returns Estimated USD value
   */
  estimateHbarToUsd: (hbarAmount: string | number, hbarPriceUSD: number = 0.07): number => {
    const amount = typeof hbarAmount === 'string' ? parseFloat(hbarAmount) : hbarAmount;
    return amount * hbarPriceUSD;
  }
};

/**
 * Generic fetch function with error handling
 */
async function fetchAPI(
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> {
  // Ensure endpoint starts with /api
  if (!endpoint.startsWith('/api')) {
    endpoint = '/api' + endpoint;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * User-related API calls
 */
export const userAPI = {
  // Check if a user exists in our system
  checkUserExists: async (twitterUsername: string): Promise<UserExistsResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile/${twitterUsername}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check if user exists');
      }
      const data = await response.json();
      return {
        exists: data.success ? true : false,
        user: data.user
      };
      
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // Register a user without requiring Hedera account details
  register: async (twitterUsername: string): Promise<RegisterResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: twitterUsername
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  // Link a Hedera account to a user
  linkHederaAccount: async (
    twitterUsername: string, 
    hederaAccountId: string, 
    privateKey: string, 
    networkType: string, 
    keyType: string
  ): Promise<{ success: boolean; message: string }> => {
    return fetchAPI(`/users/${twitterUsername}/link-hedera`, {
      method: 'PUT',
      body: JSON.stringify({ hederaAccountId, privateKey, networkType, keyType }),
    });
  },
  
  // Get user profile
  getProfile: async (twitterUsername: string): Promise<{ success: boolean; user: UserProfile }> => {
    return fetchAPI(`/users/profile/${twitterUsername}`);
  },
  
  // Check if a Twitter user has linked their Hedera account
  getLinkStatus: async (twitterUsername: string): Promise<LinkStatusResponse> => {
    return fetchAPI(`/users/link-status/${twitterUsername}`);
  },

  // Get transaction history for a user
  getTransactionHistory: async (twitterUsername: string): Promise<TransactionHistoryResponse> => {
    return fetchAPI(`/users/transactions/${twitterUsername}`);
  },

  // Get details for a specific transaction
  getTransactionDetails: async (
    transactionId: string, 
    twitterUsername: string
  ): Promise<TransactionDetailsResponse> => {
    return fetchAPI(`/users/transaction/${transactionId}/${twitterUsername}`);
  },

  // Get all tokens for a user
  getAllTokens: async (
    twitterUsername: string, 
    network = 'testnet', 
    limit = 100, 
    startingToken?: string
  ): Promise<TokensResponse> => {
    let endpoint = `/users/tokens/${twitterUsername}?network=${network}&limit=${limit}`;
    if (startingToken) {
      endpoint += `&startingToken=${startingToken}`;
    }
    return fetchAPI(endpoint);
  },

  // Get token details by ID
  getTokenDetails: async (
    tokenId: string, 
    twitterUsername: string, 
    network = 'testnet'
  ): Promise<TokenDetailResponse> => {
    return fetchAPI(`/users/token/${tokenId}/${twitterUsername}?network=${network}`);
  },

  // Get user's HBAR balance
  getHbarBalance: async (
    twitterUsername: string,
    network = 'testnet'
  ): Promise<HbarBalanceResponse> => {
    return fetchAPI(`/users/hbar-balance/${twitterUsername}?network=${network}`);
  }
};

/**
 * Payment-related API calls
 */
export const paymentAPI = {
  // Create a new payment
  createPayment: async (
    senderTwitterName: string, 
    recipientTwitterName: string, 
    amount: number, 
    tokenType: string = 'HBAR'
  ): Promise<PaymentResponse> => {
    return fetchAPI('/payments', {
      method: 'POST',
      body: JSON.stringify({
        senderTwitterName,
        recipientTwitterName,
        amount,
        tokenType,
      }),
    });
  }
};

/**
 * Eliza-related API calls
 */
export const elizaAPI = {
  // Send a message to the Eliza agent
  sendMessage: async (
    text: string, 
    userName: string
  ): Promise<ElizaMessageResponse> => {
    return fetchAPI('/eliza/message', {
      method: 'POST',
      body: JSON.stringify({ 
        text, 
        userId: userName, // Using username as userId for simplicity
        userName 
      }),
    });
  },
  
  // Check Eliza service status
  getStatus: async (): Promise<ElizaStatusResponse> => {
    return fetchAPI('/eliza/status');
  },
};

/**
 * Health check
 */
export const checkHealth = async (): Promise<HealthResponse> => {
  return fetchAPI('/health');
};

export default {
  user: userAPI,
  payment: paymentAPI,
  eliza: elizaAPI,
  health: checkHealth,
  hedera: hederaUtils
}; 