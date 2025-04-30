'use client';

import { useEffect, useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { toast } from "sonner";
import { ProfileCard } from '@/components/ProfileCard';
import { AccountDisplay } from '@/components/AccountDisplay';
import { PaymentForm } from '@/components/dashboard/PaymentForm';
import { TransactionList } from '@/components/TransactionList';
import { WalletInfo } from '@/components/dashboard/WalletInfo';
import { TokenBalances } from '@/components/TokenBalances';
import { ElizaStatus } from '@/components/ElizaStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRightLeft, 
  Clock,
  Loader2,
  Wallet,
  CreditCard,
  Bot
} from 'lucide-react';
import { paymentAPI } from '@/utils/api';

export default function Dashboard() {
  const { isLoading, user, isLinked, refreshTransactions, refreshTokenBalances, refreshUserProfile } = useApp();
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState("send");
  const [localTransactionsLoading, setLocalTransactionsLoading] = useState(false);
  // Add a ref to track if we've loaded data
  const initialDataLoaded = useRef(false);

  // Load initial data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      // Only load initial data once
      if (initialDataLoaded.current) return;
      
      if (user?.twitterUsername && isLinked) {
        try {
          // Run these in sequence to prevent overwhelming the API
          try {
            setLocalTransactionsLoading(true);
            await refreshTransactions();
            setLocalTransactionsLoading(false);
          } catch (error) {
            console.error("Failed to load transactions:", error);
            setLocalTransactionsLoading(false);
          }
          
          try {
            await refreshTokenBalances();
          } catch (error) {
            console.error("Failed to load token balances:", error);
          }
          
          try {
            await refreshUserProfile();
          } catch (error) {
            console.error("Failed to refresh user profile:", error);
          }
          
          // Mark that we've loaded data
          initialDataLoaded.current = true;
        } catch (error) {
          console.error("Failed to load initial data:", error);
        }
      }
      setIsInitializing(false);
    };

    loadInitialData();
    
    // Reset ref when user changes
    return () => {
      if (!user?.twitterUsername) {
        initialDataLoaded.current = false;
      }
    };
  }, [user?.twitterUsername, isLinked]);

  // Loading state only for initial page load, not for tab changes
  if ((isLoading && !localTransactionsLoading) || isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  const handleSendPayment = async (data: {recipient: string, amount: number, tokenType: string}) => {
    if (!user?.twitterUsername) {
      toast.error('You must be logged in to send payments');
      return;
    }
    
    try {
      // Show loading toast
      const loadingToast = toast.loading('Processing payment...');
      
      // Call the payment API
      const response = await paymentAPI.createPayment(
        user.twitterUsername,
        data.recipient,
        data.amount,
        data.tokenType
      );
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      // Show success message
      toast.success(`Payment sent successfully`, {
        description: `You sent ${data.amount} ${data.tokenType} to @${data.recipient}`,
        action: {
          label: "View TX",
          onClick: () => window.open(`https://hashscan.io/testnet/transaction/${response.transactionId}`, '_blank')
        }
      });
      
      // Refresh transaction list and token balances
      try {
        setLocalTransactionsLoading(true);
        await refreshTransactions();
        setLocalTransactionsLoading(false);
      } catch (error) {
        console.error("Failed to refresh transactions:", error);
        setLocalTransactionsLoading(false);
      }
      
      try {
        await refreshTokenBalances();
      } catch (error) {
        console.error("Failed to refresh token balances:", error);
      }
      
    } catch (error: any) {
      toast.error(`Failed to send payment`, {
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  return (
    <main className="flex-grow max-w-7xl mx-auto py-3 sm:py-6 px-2 sm:px-6 lg:px-8">
      <div className="py-3 sm:py-6">
        {/* Main grid layout with improved responsiveness */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8">
          {/* Wallet Info */}
          <div className="w-full">
            <WalletInfo />
          </div>
          
          {/* Conditional Account Display only shown if not linked */}
          {!isLinked && <AccountDisplay showLinkForm={true} />}
          
          {/* Tabs Section */}
          <div className="w-full">
            <Tabs 
              defaultValue="send" 
              className="bg-white rounded-lg border shadow-sm"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabsList className="grid w-full grid-cols-3 rounded-t-lg overflow-hidden">
                <TabsTrigger value="send" className="flex flex-col items-center py-2 sm:py-3">
                  <ArrowRightLeft className="h-4 w-4 mb-1" />
                  <span className="text-xs">Send Payment</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="flex flex-col items-center py-2 sm:py-3">
                  <Clock className="h-4 w-4 mb-1" />
                  <span className="text-xs">Transaction History</span>
                </TabsTrigger>
                <TabsTrigger value="assistant" className="flex flex-col items-center py-2 sm:py-3" disabled={!isLinked}>
                  <Bot className="h-4 w-4 mb-1" />
                  <span className="text-xs">AI Assistant</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="send" className="p-2 sm:p-4">
                {isLinked ? (
                  <PaymentForm onSubmit={handleSendPayment} />
                ) : (
                  <div className="p-4 sm:p-6 text-center">
                    <p className="mb-4 text-gray-600">Please link your Hedera account to send payments.</p>
                    <AccountDisplay showLinkForm={true} />
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="p-2 sm:p-4">
                <TransactionList localLoading={localTransactionsLoading} />
              </TabsContent>
              
              <TabsContent value="assistant" className="p-2 sm:p-4">
                <div className="p-2 sm:p-4">
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border mb-4">
                    <h3 className="text-sm font-medium mb-2">AI Assistant Commands</h3>
                    <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
                      <li className="break-words"><code className="bg-gray-100 px-1 py-0.5 rounded">@hederapaybot send @username 10 HBAR</code> - Send payment</li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">@hederapaybot balance</code> - Check your balance</li>
                      <li><code className="bg-gray-100 px-1 py-0.5 rounded">@hederapaybot help</code> - Get help with commands</li>
                    </ul>
                  </div>
                  {isLinked ? (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                        <input 
                          type="text" 
                          placeholder="Type your command here..." 
                          className="flex-1 px-3 py-2 border rounded-md text-sm"
                          disabled
                        />
                        <button 
                          className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium disabled:opacity-50"
                          disabled
                        >
                          Send
                        </button>
                      </div>
                      <p className="text-xs text-yellow-600 font-medium">
                        Coming Soon: Direct interaction with Eliza Assistant from this dashboard
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 text-center">
                      <p className="mb-4 text-gray-600">Please link your Hedera account to use the AI assistant.</p>
                      <AccountDisplay showLinkForm={true} />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Eliza Status - if linked */}
          {isLinked && (
            <div className="w-full">
              <ElizaStatus />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}