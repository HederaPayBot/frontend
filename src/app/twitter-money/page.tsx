'use client';

import { useEffect, useState } from 'react';
import { BalanceCard } from '@/components/BalanceCard';
import { SimpleTransactionList } from '@/components/SimpleTransactionList';
import { SimplePaymentForm } from '@/components/SimplePaymentForm';
import { BottomNavigation } from '@/components/BottomNavigation';
import { CommandCarousel } from '@/components/CommandCarousel';
import { HederaAccountForm } from '@/components/HederaAccountForm';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
import { paymentAPI } from '@/utils/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowRightLeft, 
  BadgeDollarSign, 
  CircleDollarSign, 
  HelpCircle, 
  Wallet, 
  Clock 
} from 'lucide-react';

export default function TwitterMoneyPage() {
  const { user, refreshTransactions } = useApp();
  const [activeTab, setActiveTab] = useState<string>('home');
  
  // Mock data for initial state
  const [balance, setBalance] = useState({
    tokenSymbol: 'SOL',
    tokenAmount: 3.45,
    fiatValue: 397.52
  });
  
  const [transactions, setTransactions] = useState([
    {
      id: '1',
      type: 'sent' as const,
      otherParty: 'johndoe',
      amount: 1.0,
      tokenSymbol: 'SL',
      timestamp: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
    },
    {
      id: '2',
      type: 'received' as const,
      otherParty: 'janesmith',
      amount: 2.5,
      tokenSymbol: 'SOL',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    {
      id: '3',
      type: 'sent' as const,
      otherParty: 'user123',
      amount: 0.5,
      tokenSymbol: 'SOL',
      timestamp: new Date('2023-04-22') 
    }
  ]);

  // Twitter command examples for carousel
  const commandExamples = [
    {
      command: '@hederapaybot send @friend 10 HBAR',
      description: 'Send HBAR to another Twitter user',
      output: (
        <>
          <div className="text-green-400">✓ Transaction successful</div>
          <div>Sent 10 HBAR to @friend</div>
          <div className="text-xs text-gray-500 mt-1">Transaction ID: 0.0.12345@1680000000.000000000</div>
        </>
      )
    },
    {
      command: '@hederapaybot balance',
      description: 'Check your current balance',
      output: (
        <>
          <div className="text-green-400">Your balance:</div>
          <div>HBAR: 32.45</div>
          <div>USDC: 15.00</div>
          <div className="text-xs text-gray-500 mt-1">Account ID: 0.0.12345</div>
        </>
      )
    },
    {
      command: '@hederapaybot help',
      description: 'Get help and see available commands',
      output: (
        <>
          <div className="text-green-400">Available commands:</div>
          <div>send @user [amount] [token] - Send tokens</div>
          <div>balance - Check your balance</div>
          <div>history - View your last 5 transactions</div>
          <div>help - Display this help message</div>
        </>
      )
    },
    {
      command: '@hederapaybot tip @user 5 USDC for the great article!',
      description: 'Send a tip with a personal message',
      output: (
        <>
          <div className="text-green-400">✓ Tip sent successfully</div>
          <div>Tipped 5 USDC to @user</div>
          <div className="text-xs text-gray-500 mt-1">Message: "for the great article!"</div>
        </>
      )
    },
  ];
  
  // Effect to load real data once available
  useEffect(() => {
    if (user) {
      // In a real app, you would:
      // 1. Load user balance from API
      // 2. Load user transactions from API
      // For now, we'll use mock data
      
      const loadRealData = async () => {
        try {
          // Uncomment once API is ready
          // const txHistory = await paymentAPI.getPaymentHistory(user.twitterUsername);
          // 
          // const formattedTransactions = txHistory.transactions.map(tx => ({
          //   id: tx.id,
          //   type: tx.sender === user.twitterUsername ? 'sent' : 'received',
          //   otherParty: tx.sender === user.twitterUsername ? tx.recipient : tx.sender,
          //   amount: tx.amount,
          //   tokenSymbol: tx.tokenType,
          //   timestamp: new Date(tx.timestamp)
          // }));
          // 
          // setTransactions(formattedTransactions);
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      };
      
      loadRealData();
    }
  }, [user]);
  
  const handleSendPayment = async (recipient: string, amount: number, token: string) => {
    if (!user) {
      toast.error('You must be logged in to send payments');
      return;
    }
    
    try {
      // Remove @ if it exists
      const recipientName = recipient.startsWith('@') ? recipient.substring(1) : recipient;
      
      toast.info('Processing payment...', {
        description: `Sending ${amount} ${token} to @${recipientName}`
      });
      
      // Uncomment once API is ready
      // const response = await paymentAPI.createPayment(
      //   user.twitterUsername,
      //   recipientName,
      //   amount,
      //   token
      // );
      
      // For demo, just add to local state
      const newTransaction = {
        id: Date.now().toString(),
        type: 'sent' as const,
        otherParty: recipientName,
        amount: amount,
        tokenSymbol: token,
        timestamp: new Date()
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Update balance (in a real app, this would come from API)
      setBalance({
        ...balance,
        tokenAmount: balance.tokenAmount - amount
      });
      
      toast.success('Payment sent!', {
        description: `You sent ${amount} ${token} to @${recipientName}`
      });
      
      // Refresh transactions from API (once implemented)
      // refreshTransactions();
      
    } catch (error: any) {
      toast.error('Payment failed', {
        description: error.message || 'Something went wrong'
      });
    }
  };

  const handleLinkHederaAccount = async (formData: any) => {
    try {
      toast.info('Linking Hedera account...');
      
      // In a real app, this would call your API
      // For now, simulate a successful response after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Hedera account linked successfully!', {
        description: `Connected account ${formData.accountId}`
      });
      
      // Switch back to home tab
      setActiveTab('home');
      
      // Update user in context (this would happen via API in real app)
      // refreshUserProfile();
      
    } catch (error: any) {
      toast.error('Failed to link account', {
        description: error.message || 'Something went wrong'
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      {/* Header */}
      <header className="bg-white p-4 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Send Money on Twitter</h1>
          <div className="bg-gray-200 rounded-full px-3 py-1">
            @{user?.twitterUsername || 'blockchain_oracle'}
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4 space-y-4">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="home" className="flex flex-col items-center py-2">
              <Wallet className="h-4 w-4 mb-1" />
              <span className="text-xs">Home</span>
            </TabsTrigger>
            <TabsTrigger value="commands" className="flex flex-col items-center py-2">
              <ArrowRightLeft className="h-4 w-4 mb-1" />
              <span className="text-xs">Commands</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex flex-col items-center py-2">
              <CircleDollarSign className="h-4 w-4 mb-1" />
              <span className="text-xs">Link</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="flex flex-col items-center py-2">
              <HelpCircle className="h-4 w-4 mb-1" />
              <span className="text-xs">Help</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="home" className="space-y-4 mt-0">
            <BalanceCard 
              tokenSymbol={balance.tokenSymbol}
              tokenAmount={balance.tokenAmount}
              fiatValue={balance.fiatValue}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimpleTransactionList transactions={transactions} />
              <SimplePaymentForm 
                onSend={handleSendPayment}
                availableTokens={['SOL', 'HBAR', 'USDC']}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="commands" className="mt-0">
            <CommandCarousel examples={commandExamples} />
          </TabsContent>
          
          <TabsContent value="link" className="mt-0">
            <HederaAccountForm onSubmit={handleLinkHederaAccount} />
          </TabsContent>
          
          <TabsContent value="help" className="mt-0">
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-bold mb-4">Help & Support</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Twitter Commands</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    You can interact with our service directly on Twitter by mentioning @hederapaybot.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">Available Commands</h3>
                  <ul className="text-sm text-gray-600 mt-1 space-y-2">
                    <li className="flex">
                      <BadgeDollarSign className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <span className="font-mono">@hederapaybot send @user 10 HBAR</span>
                        <p className="text-xs">Send HBAR to another Twitter user</p>
                      </div>
                    </li>
                    <li className="flex">
                      <Wallet className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <span className="font-mono">@hederapaybot balance</span>
                        <p className="text-xs">Check your current token balances</p>
                      </div>
                    </li>
                    <li className="flex">
                      <Clock className="h-4 w-4 mr-2 text-green-600 mt-0.5" />
                      <div>
                        <span className="font-mono">@hederapaybot history</span>
                        <p className="text-xs">View your recent transactions</p>
                      </div>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium">Need Help?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Contact us at support@hederatwitter.com or tweet to @hederapaybot_support
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNavigation 
        items={[
          { label: 'Home', href: '/twitter-money' },
          { label: 'Send', href: '/twitter-money/send' },
          { label: 'Receive', href: '/twitter-money/receive' }
        ]}
      />
    </div>
  );
} 