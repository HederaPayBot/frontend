'use client';

import { useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileCard } from '@/components/ProfileCard';

export default function Profile() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { isLoading } = useApp();

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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="max-w-3xl mx-auto">
            {/* User Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <ProfileCard />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 