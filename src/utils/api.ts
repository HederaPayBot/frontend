/**
 * API utility for making requests to the backend
 */

// Base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

/**
 * Generic fetch function with error handling
 */
async function fetchAPI(
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(url,"url");
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
  // Register a new user
  register: async (twitterId: string, twitterUsername: string) => {
    return fetchAPI('/users/register', {
      method: 'POST',
      body: JSON.stringify({ twitterId, twitterUsername }),
    });
  },
  
  // Link a Hedera account to a user
  linkHederaAccount: async (twitterUsername: string, hederaAccountId: string) => {
    return fetchAPI(`/users/${twitterUsername}/link-hedera`, {
      method: 'PUT',
      body: JSON.stringify({ hederaAccountId }),
    });
  },
  
  // Get user profile
  getProfile: async (twitterUsername: string) => {
    return fetchAPI(`/users/profile/${twitterUsername}`);
  },
  
  // Check if a Twitter user has linked their Hedera account
  getLinkStatus: async (twitterUsername: string) => {
    return fetchAPI(`/users/link-status/${twitterUsername}`);
  },
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
  ) => {
    return fetchAPI('/payments', {
      method: 'POST',
      body: JSON.stringify({
        senderTwitterName,
        recipientTwitterName,
        amount,
        tokenType,
      }),
    });
  },
  
  // Get payment history for a user
  getPaymentHistory: async (twitterUsername: string) => {
    return fetchAPI(`/payments/history/${twitterUsername}`);
  },
  
  // Get details of a specific payment
  getPaymentDetails: async (transactionId: string) => {
    return fetchAPI(`/payments/${transactionId}`);
  },
};

/**
 * Eliza-related API calls
 */
export const elizaAPI = {
  // Send a message to the Eliza agent
  sendMessage: async (text: string, userName: string) => {
    return fetchAPI('/eliza/message', {
      method: 'POST',
      body: JSON.stringify({ 
        text, 
        userId: userName, // Using username as userId for simplicity
        userName 
      }),
    });
  },
  
  // Send a command to Eliza (wrapper around the command endpoint)
  sendCommand: async (command: string, userName: string) => {
    return fetchAPI('/command', {
      method: 'POST',
      body: JSON.stringify({ 
        command, 
        userName 
      }),
    });
  },
  
  // Check Eliza service status
  getStatus: async () => {
    return fetchAPI('/eliza/status');
  },
};

/**
 * Health check
 */
export const checkHealth = async () => {
  return fetchAPI('/health');
};

export default {
  user: userAPI,
  payment: paymentAPI,
  eliza: elizaAPI,
  health: checkHealth,
}; 