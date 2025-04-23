'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCard } from '@/components/ProfileCard';
import { AccountDisplay } from '@/components/AccountDisplay';

export default function Profile() {
  const router = useRouter();
  const { ready, authenticated, logout } = usePrivy();
  const { user, isLoading } = useApp();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push('/');
    }
  }, [ready, authenticated, router]);

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
          <h1 className="text-2xl font-bold text-gray-900">User Profile</h1>
          <div className="flex space-x-4">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="text-gray-600 hover:text-gray-900"
            >
              Dashboard
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
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* User Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileCard />
              </CardContent>
            </Card>

            {/* Hedera Account Management */}
            <Card>
              <CardHeader>
                <CardTitle>Hedera Account</CardTitle>
              </CardHeader>
              <CardContent>
                <AccountDisplay showLinkForm={true} />
              </CardContent>
            </Card>

            {/* Twitter Command Guide */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Twitter Command Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="font-medium text-sm text-gray-700 mb-2">Send HBAR</h3>
                    <p className="text-gray-600 text-sm font-mono bg-white p-2 rounded border">
                      @hedera_pay send 5 HBAR to @friend123
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="font-medium text-sm text-gray-700 mb-2">Send with Message</h3>
                    <p className="text-gray-600 text-sm font-mono bg-white p-2 rounded border">
                      @hedera_pay send 5 HBAR to @friend123 for lunch yesterday
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <h3 className="font-medium text-sm text-gray-700 mb-2">Check Balance</h3>
                    <p className="text-gray-600 text-sm font-mono bg-white p-2 rounded border">
                      @hedera_pay balance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 