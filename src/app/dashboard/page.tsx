'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { toast } from "sonner";
import { ProfileCard } from '@/components/ProfileCard';
import { AccountDisplay } from '@/components/AccountDisplay';
import { PaymentForm } from '@/components/dashboard/PaymentForm';
import { TransactionList } from '@/components/TransactionList';
import { CommandInterface } from '@/components/dashboard/CommandInterface';
import { WalletInfo } from '@/components/dashboard/WalletInfo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommandCarousel } from '@/components/CommandCarousel';
import { 
  ArrowRightLeft, 
  Wallet, 
  Clock,
  HelpCircle
} from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();
  const { isLoading, user, refreshTransactions } = useApp();

  // Redirect to home if not authenticated
  if (ready && !authenticated) {
    router.push('/');
    return null;
  }

  // Loading state
  if (!ready || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8247E5]"></div>
      </div>
    );
  }
  
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
  
  const handleExecuteCommand = async (command: string, params: Record<string, any>) => {
    try {
      // In a real implementation, this would call your backend API
      console.log(`Executing ${command} with params:`, params);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast.success(`${command} executed successfully`, {
        description: `Command was sent to the Hedera network`,
      });
      
      // Refresh transaction list
      refreshTransactions();
      
    } catch (error: any) {
      toast.error(`Failed to execute ${command}`, {
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  const handleSendPayment = async (data: {recipient: string, amount: number, tokenType: string}) => {
    console.log('Payment submitted:', data);
    refreshTransactions();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Hedera Twitter Pay</h1>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-200 rounded-full px-3 py-1 mr-2">
              @{user?.twitterUsername || 'user'}
            </div>
            <Button
              onClick={() => router.push('/profile')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
            >
              Profile
            </Button>
            <Button
              onClick={() => router.push('/transactions')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
            >
              Transactions
            </Button>
            <Button
              onClick={() => logout()}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Command Interface */}
          <div className="mb-8">
            <CommandInterface onExecute={handleExecuteCommand} />
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left Sidebar */}
            <div className="col-span-1 space-y-6">
              <ProfileCard />
              <WalletInfo />
              <AccountDisplay showLinkForm={!user?.hederaAccountId} />
            </div>

            {/* Main Content */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              <Tabs defaultValue="send">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="send" className="flex flex-col items-center py-2">
                    <ArrowRightLeft className="h-4 w-4 mb-1" />
                    <span className="text-xs">Send</span>
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex flex-col items-center py-2">
                    <Clock className="h-4 w-4 mb-1" />
                    <span className="text-xs">History</span>
                  </TabsTrigger>
                  <TabsTrigger value="commands" className="flex flex-col items-center py-2">
                    <Wallet className="h-4 w-4 mb-1" />
                    <span className="text-xs">Commands</span>
                  </TabsTrigger>
                  <TabsTrigger value="help" className="flex flex-col items-center py-2">
                    <HelpCircle className="h-4 w-4 mb-1" />
                    <span className="text-xs">Help</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="send" className="pt-4">
                  <PaymentForm onSubmit={handleSendPayment} />
                </TabsContent>
                <TabsContent value="history" className="pt-4">
                  <TransactionList />
                </TabsContent>
                <TabsContent value="commands" className="pt-4">
                  <CommandCarousel examples={commandExamples} />
                </TabsContent>
                <TabsContent value="help" className="pt-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <h3 className="text-lg font-medium mb-4">Twitter Pay Help</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium">How to Send Payments</h4>
                        <p className="text-sm text-gray-600">Use the Send tab to send payments to Twitter users, or use the Twitter command interface directly with @hederapaybot.</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Available Commands</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                          <li>send @user [amount] [token] - Send tokens to a Twitter user</li>
                          <li>balance - Check your current balance</li>
                          <li>history - View your recent transactions</li>
                          <li>tip @user [amount] [token] [message] - Send a tip with a message</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium">Need More Help?</h4>
                        <p className="text-sm text-gray-600">Contact support at support@hederatwitterpay.com</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}