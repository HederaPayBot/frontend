'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ProfileCard } from '@/components/ProfileCard';
import { AccountDisplay } from '@/components/AccountDisplay';
import { PaymentForm } from '@/components/dashboard/PaymentForm';
import { TransactionList } from '@/components/TransactionList';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();
  const { isLoading } = useApp();

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Hedera Twitter Pay</h1>
          <div className="flex items-center space-x-4">
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Left Sidebar */}
            <div className="col-span-1 space-y-6">
              <ProfileCard />
              <AccountDisplay showLinkForm={true} />
            </div>

            {/* Main Content */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              <PaymentForm onSubmit={(data) => {}} />
              <TransactionList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 